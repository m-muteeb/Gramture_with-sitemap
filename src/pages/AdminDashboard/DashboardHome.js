// ResponsiveForm.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Form, Input, Button, Select, message, Card, Switch } from 'antd';
import { LoadingOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
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
  const [mcqs, setMcqs] = useState([{ question: '', options: ['', '', '', ''], correctAnswer: '', logic: '' }]);
  const [isShortQuestion, setIsShortQuestion] = useState(false);
  const [shortQuestions, setShortQuestions] = useState([{ question: '', answer: '' }]);

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
        }
        if (draft.shortQuestions) {
          setShortQuestions(draft.shortQuestions);
          setIsShortQuestion(true);
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
        subCategory: isMCQ ? 'MCQ Test' : isShortQuestion ? 'Short Questions' : subCategory,
        description: description || '',
        fileURLs,
        mcqs: isMCQ ? mcqs : [],
        shortQuestions: isShortQuestion ? shortQuestions : [],
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
      const draftData = { ...values, description, mcqs, shortQuestions };
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
    setMcqs([{ question: '', options: ['', '', '', ''], correctAnswer: '', logic: '' }]);
    setShortQuestions([{ question: '', answer: '' }]);
    setIsMCQ(false);
    setIsShortQuestion(false);
    message.success('Draft cleared!', 3);
  };

  const handleMCQChange = (index, key, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[index][key] = value;
    setMcqs(updatedMcqs);
  };

  const handleAddMCQ = () => {
    setMcqs([...mcqs, { question: '', options: ['', '', '', ''], correctAnswer: '', logic: '' }]);
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
            onChange={(newContent) => handleMCQChange(index, 'question', newContent)}
          />
        </Form.Item>
        <Form.Item label="Options" required>
          {mcq.options.map((option, optionIndex) => (
            <div key={optionIndex} style={{ marginBottom: '8px' }}>
              <Input
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
            </div>
          ))}
        </Form.Item>
        {mcq.correctAnswer && (
          <Form.Item label="Logic for Correct Answer (Optional)">
            <Input.TextArea
              rows={2}
              placeholder="Explain why this is the correct answer"
              value={mcq.logic}
              onChange={(e) => handleMCQChange(index, 'logic', e.target.value)}
            />
          </Form.Item>
        )}
      </div>
    ));
  };

  const renderShortQuestions = () => {
    return shortQuestions.map((sq, index) => (
      <div key={index} style={{ marginBottom: '16px', padding: '16px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
        
        <Form.Item label="Question" required>
          <JoditEditor
            value={sq.question}
            config={{
              readonly: false,
              height: 150,
              toolbarSticky: false,
              buttons: 'bold,italic,underline,strikethrough,ul,ol,font,color',
              uploader: { insertImageAsBase64URI: true },
            }}
            onChange={(newContent) => {
              const updated = [...shortQuestions];
              updated[index].question = newContent;
              setShortQuestions(updated);
            }}
          />
        </Form.Item>
        <Form.Item label="Answer" required>
         
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
            <Switch checked={isMCQ} onChange={(val) => { setIsMCQ(val); if (val) setIsShortQuestion(false); }} />
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

          {isShortQuestion && (
            <>
              {renderShortQuestions()}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => setShortQuestions([...shortQuestions, { question: '', answer: '' }])}
                  block
                  icon={<PlusOutlined />}
                >
                  Add More Short Questions
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
