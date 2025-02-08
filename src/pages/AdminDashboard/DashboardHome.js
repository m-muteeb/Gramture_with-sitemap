import React, { useState, useEffect } from 'react';
import { Form, Input, Upload, Button, Select, message, Card } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import { storage, fireStore } from '../../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "../../assets/css/dashboardhome.css";

const { Option } = Select;

const ResponsiveForm = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [addingClass, setAddingClass] = useState(false);
  const [newClass, setNewClass] = useState('');
  const [savingDraft, setSavingDraft] = useState(false);

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
      }
    };

    fetchClasses();
  }, [form]);

  const onFinish = async (values) => {
    const { topic, class: selectedClasses, category, subCategory, file } = values;
  
    setUploading(true);
    let fileURL = [];
  
    if (file && file.length > 0) {
      for (const fileItem of file) {
        const uniqueFileName = `${Date.now()}-${fileItem.name}`;
        const storageRef = ref(storage, `uploads/${uniqueFileName}`);
        const uploadTask = uploadBytesResumable(storageRef, fileItem.originFileObj);
  
        try {
          await new Promise((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log(`Upload is ${progress}% done`);
              },
              (error) => {
                console.error('Upload failed:', error);
                message.error('File upload failed.', 3);
                reject(error);
              },
              async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                fileURL.push(downloadURL);
                resolve();
              }
            );
          });
        } catch (error) {
          setUploading(false);
          return;
        }
      }
    }
  
    try {
      await addDoc(collection(fireStore, 'topics'), {
        topic: topic || '',
        class: selectedClasses.join(', '),
        category: category || '',
        subCategory: subCategory || '',
        description: description || '',
        fileURL,
        timestamp: new Date(),
      });
  
      message.success('Topic created successfully!', 3);
      form.resetFields();  // Clear the form after successful submission
      localStorage.removeItem('draft');
  
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
      const draftData = { ...values, description };
      localStorage.setItem('draft', JSON.stringify(draftData));
      message.success('Product saved as draft successfully!', 3);
    } catch (error) {
      message.error('Error saving draft', 3);
    } finally {
      setSavingDraft(false);
    }
  };

  const quillModules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'direction': 'rtl' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      ['clean'],
    ],
  };

  return (
    <div className="form-container mt-2">
      <h1 className="text-center mb-2">Create Topic</h1>
      <Card
        bordered={false}
        style={{
          margin: '20px auto',
          width: '100%',  
          borderRadius: '10px',
        }}
      >
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
                  <div style={{ display: 'flex', flexWrap: 'nowrap', padding: 8 }}>
                    <Input
                      style={{ flex: 'auto' }}
                      placeholder="Add new class"
                      value={newClass}
                      onChange={(e) => setNewClass(e.target.value)}
                      onPressEnter={handleAddClass}
                    />
                    <Button
                      type="primary"
                      icon={addingClass ? <LoadingOutlined /> : <PlusOutlined />}
                      onClick={handleAddClass}
                    >
                      {addingClass ? 'Adding...' : 'Add'}
                    </Button>
                  </div>
                </>
              )}
            >
              {classes.map((classOption) => (
                <Option key={classOption.id} value={classOption.name}>
                  {classOption.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="SubCategory" name="subCategory">
            <Input placeholder="Enter subcategory" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <ReactQuill value={description} onChange={setDescription} theme="snow" placeholder="Enter the description" modules={quillModules} />
          </Form.Item>

          <Form.Item label="Upload File" name="file" valuePropName="fileList" getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}>
            <Upload name="file" beforeUpload={() => false} accept=".jpg,.jpeg,.png,.pdf" multiple>
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

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

          {/* Save Draft Button */}
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
        </Form>
      </Card>
    </div>
  );
};

export default ResponsiveForm;
