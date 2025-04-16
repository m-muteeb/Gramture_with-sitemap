import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Upload, Button, Select, message, Card, Switch } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { storage, fireStore } from '../../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import JoditEditor from 'jodit-react';
import "../../assets/css/dashboardhome.css";

const { Option } = Select;

const ResponsiveForm = () => {
  const navigate = useNavigate();
  const editor = useRef(null);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);
  const [isMCQ, setIsMCQ] = useState(false);
  const [numMCQs, setNumMCQs] = useState(1);
  const [mcqs, setMcqs] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchClasses = async () => {
      const querySnapshot = await getDocs(collection(fireStore, 'classes'));
      const fetchedClasses = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setClasses(fetchedClasses);

      const draft = JSON.parse(localStorage.getItem('draft'));
      if (draft) {
        setDescription(draft.description || '');
        form.setFieldsValue(draft);
        if (draft.mcqs) {
          setMcqs(draft.mcqs);
          setIsMCQ(true);
          setNumMCQs(draft.mcqs.length);
        }
      }
    };

    fetchClasses();
  }, [form]);

  const onFinish = async (values) => {
    const { topic, class: selectedClasses, category, subCategory, file } = values;

    setUploading(true);
    let fileURLs = [];

    if (file && file.length > 0) {
      try {
        const uploadPromises = file.map((fileItem) => {
          const uniqueFileName = `${Date.now()}-${fileItem.name}`;
          const storageRef = ref(storage, `uploads/${uniqueFileName}`);
          const uploadTask = uploadBytesResumable(storageRef, fileItem.originFileObj);

          return new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              null,
              (error) => {
                console.error('Upload failed:', error);
                message.error('File upload failed.', 3);
                reject(error);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                fileURLs.push(downloadURL);
                resolve();
              }
            );
          });
        });

        await Promise.all(uploadPromises);
      } catch (error) {
        setUploading(false);
        return;
      }
    }

    try {
      const topicData = {
        topic: topic || '',
        class: selectedClasses.join(', '),
        category: category || '',
        subCategory: isMCQ ? 'MCQ Test' : subCategory,
        description: description || '',
        fileURLs,
        mcqs: isMCQ ? mcqs : [],
        timestamp: new Date(),
      };

      await addDoc(collection(fireStore, 'topics'), topicData);
      message.success('Topic created successfully!', 3);
      localStorage.removeItem('draft');
      navigate('/ManageProducts');
    } catch (e) {
      console.error('Error adding document:', e);
      message.error('Failed to save topic.', 3);
    } finally {
      setUploading(false);
    }
  };

  const handleAddClass = async () => {
    if (newClass && !classes.some(cls => cls.name === newClass)) {
      setAddingClass(true);
      try {
        const docRef = await addDoc(collection(fireStore, 'classes'), { name: newClass });
        setClasses([...classes, { id: docRef.id, name: newClass }]);
        setNewClass('');
        message.success(`Class ${newClass} added successfully!`, 3);
      } catch (e) {
        console.error('Error adding class:', e);
        message.error('Failed to add class.', 3);
      } finally {
        setAddingClass(false);
      }
    }
  };

  const handleSaveDraft = async (values) => {
    setSavingDraft(true);
    try {
      const draftData = { ...values, description, mcqs };
      localStorage.setItem('draft', JSON.stringify(draftData));
      message.success('Draft saved successfully!', 3);
    } catch (error) {
      message.error('Error saving draft', 3);
    } finally {
      setSavingDraft(false);
    }
  };

  const handleClearDraft = () => {
    localStorage.removeItem('draft');
    form.resetFields();
    setDescription('');
    setMcqs([{ question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    setNumMCQs(1);
    message.success('Draft cleared!', 3);
  };

  const handleMCQChange = (index, key, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[index][key] = value;
    setMcqs(updatedMcqs);
  };

  const handleAddMCQ = () => {
    setMcqs([...mcqs, { question: '', options: ['', '', '', ''], correctAnswer: '' }]);
    setNumMCQs(mcqs.length + 1);
  };

  const handleMCQCountChange = (value) => {
    setNumMCQs(value);
    const updatedMcqs = [...mcqs];
    while (updatedMcqs.length < value) {
      updatedMcqs.push({ question: '', options: ['', '', '', ''], correctAnswer: '' });
    }
    setMcqs(updatedMcqs.slice(0, value));
  };

  const renderMCQTemplate = () => {
    return mcqs.map((mcq, index) => (
      <div key={index} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
        <h4>MCQ {index + 1}</h4>
        <Form.Item label="Question" required>
          <JoditEditor
            value={mcq.question}
            config={{
              readonly: false,
              height: 150,
              toolbarSticky: false,
              toolbarAdaptive: false,
              buttons: 'bold,italic,underline,brush,ul,ol,font,color',
              uploader: { insertImageAsBase64URI: true },
            }}
            // ✅ CHANGED from onBlur to onChange
            onChange={(newContent) => handleMCQChange(index, 'question', newContent)}
          />
        </Form.Item>
        <Form.Item label="Options" required>
          {mcq.options.map((option, optionIndex) => (
            <Input
              key={optionIndex}
              addonBefore={
                <input
                  type="radio"
                  name={`correct-${index}`}
                  checked={mcq.correctAnswer === option}
                  onChange={() => handleMCQChange(index, 'correctAnswer', option)}
                />
              }
              value={option}
              onChange={(e) => {
                const updatedOptions = [...mcq.options];
                const oldOption = option;
                updatedOptions[optionIndex] = e.target.value;
                handleMCQChange(index, 'options', updatedOptions);
                if (mcq.correctAnswer === oldOption) {
                  handleMCQChange(index, 'correctAnswer', e.target.value);
                }
              }}
              placeholder={`Option ${optionIndex + 1}`}
            />
          ))}
        </Form.Item>
      </div>
    ));
  };

  return (
    <div className="form-container mt-2">
      <h1 className="text-center mb-2">Create Topic</h1>
      <Card bordered={false} style={{ margin: '20px auto', width: '100%', borderRadius: '10px' }}>
        <Form layout="vertical" onFinish={onFinish} autoComplete="off" form={form}>
          <Form.Item label="Topic Name" name="topic">
            <Input placeholder="Enter topic name" />
          </Form.Item>

          <Form.Item label="Class" name="class" rules={[{ required: true, message: 'Please select a class!' }]}>
            <Select
              mode="multiple"
              placeholder="Select class(es)"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div style={{ display: 'flex', padding: 8 }}>
                    <Input
                      style={{ flex: 'auto' }}
                      placeholder="Add new class"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      onPressEnter={handleAddClass}
                    />
                    <Button type="primary" icon={addingClass ? <LoadingOutlined /> : <PlusOutlined />} onClick={handleAddClass}>
                      {addingClass ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </>
              )}
            >
              {classes.map((cls) => (
                <Option key={cls.id} value={cls.name}>
                  {cls.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="SubCategory" name="subCategory">
            <Input placeholder="Enter subcategory" />
          </Form.Item>

          <Form.Item label="MCQ Test" name="mcqSwitch">
            <Switch checked={isMCQ} onChange={setIsMCQ} />
          </Form.Item>

          <Form.Item label="Description">
            <JoditEditor
              ref={editor}
              value={description}
              config={{
                readonly: false,
                height: 300,
                width: '100%',
                buttons: 'bold,italic,underline,strikethrough,brush,ul,ol,font,color',
                uploader: { insertImageAsBase64URI: true },
              }}
              onBlur={(newContent) => setDescription(newContent)}
            />
          </Form.Item>

          {isMCQ && (
            <>
              {renderMCQTemplate()}
              <Form.Item>
                <Button type="dashed" onClick={handleAddMCQ} block icon={<PlusOutlined />}>
                  Add More MCQs
                </Button>
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" block disabled={uploading}>
              {uploading ? <LoadingOutlined /> : 'Submit'}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="default" block onClick={() => navigate('/ManageProducts')}>
              Manage Topics
            </Button>
          </Form.Item>

          <Form.Item>
            <Button
              type="default"
              block
              icon={<SaveOutlined />}
              onClick={() => handleSaveDraft(form.getFieldsValue())}
              loading={savingDraft}
            >
              {savingDraft ? 'Saving Draft...' : 'Save as Draft'}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="danger" block onClick={handleClearDraft}>
              Clear Draft
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResponsiveForm;
