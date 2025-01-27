import React, { useState, useEffect } from 'react';
import { Form, Input, DatePicker, Upload, Button, Select, message, Card } from 'antd';
import { UploadOutlined, LoadingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { storage, fireStore } from '../../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill CSS

const { Option } = Select;

const ResponsiveForm = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState(''); // State to store the description
  const [uploading, setUploading] = useState(false); // State to manage upload status
  const [classes, setClasses] = useState([]); // State to store the class options
  const [addingClass, setAddingClass] = useState(false); // State to manage class add status
  const [newClass, setNewClass] = useState(''); // State to track the new class to be added

  // Fetch classes from Firestore on component mount
  useEffect(() => {
    const fetchClasses = async () => {
      const querySnapshot = await getDocs(collection(fireStore, 'classes'));
      const fetchedClasses = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setClasses(fetchedClasses);
    };

    fetchClasses();
  }, []);

  const onFinish = async (values) => {
    const { topic, date, class: selectedClasses, category, subCategory, file } = values;

    setUploading(true);
    let fileURL = '';

    if (file && file[0]) {
      const uniqueFileName = `${Date.now()}-${file[0].name}`;
      const storageRef = ref(storage, `uploads/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file[0].originFileObj);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error('Upload failed:', error);
          message.error('File upload failed. Please try again.');
          setUploading(false);
        },
        async () => {
          try {
            fileURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('File available at:', fileURL);

            await addDoc(collection(fireStore, 'topics'), {
              topic: topic || '',
              date: date ? date.format('YYYY-MM-DD') : '',
              class: selectedClasses.join(', '),
              category: category || '',
              subCategory: subCategory || '',
              description: description || '',
              fileURL,
              timestamp: new Date(),
            });

            message.success('Topic created successfully!');
          } catch (e) {
            console.error('Error adding document:', e);
            message.error('Failed to save topic. Please try again.');
          } finally {
            setUploading(false);
          }
        }
      );
    } else {
      try {
        await addDoc(collection(fireStore, 'topics'), {
          topic: topic || '',
          date: date ? date.format('YYYY-MM-DD') : '',
          class: selectedClasses.join(', '),
          category: category || '',
          subCategory: subCategory || '',
          description: description || '',
          fileURL,
          timestamp: new Date(),
        });

        message.success('Topic created successfully!');
      } catch (e) {
        console.error('Error adding document:', e);
        message.error('Failed to save topic. Please try again.');
      } finally {
        setUploading(false);
      }
    }
  };

  const handleAddClass = async () => {
    if (newClass && !classes.some(cls => cls.name === newClass)) {
      setAddingClass(true);
      try {
        const docRef = await addDoc(collection(fireStore, 'classes'), { name: newClass });
        setClasses([...classes, { id: docRef.id, name: newClass }]);
        setNewClass('');
        message.success(`Class ${newClass} added successfully!`);
      } catch (e) {
        console.error('Error adding class:', e);
        message.error('Failed to add class. Please try again.');
      } finally {
        setAddingClass(false);
      }
    }
  };

 

  const quillModules = {
    toolbar: [
      [{ 'header': '1' }, { 'header': '2' }, { 'font': [] }],
      [{ size: [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'color': [] }, { 'background': [] }], // dropdown with defaults from theme
      [{ 'align': [] }],
      ['link', 'image'],
      [{ 'direction': 'rtl' }], // Support for Right-to-Left languages
      [{ 'script': 'sub' }, { 'script': 'super' }], // Superscript/Subscript
      ['clean']
    ],
  };

  return (
    <div className="form-container mt-2">
      <h1 className="text-center mb-2">Create Topic</h1>
      <Card
        bordered={false}
        style={{
          margin: '20px auto',
          boxShadow: '0 12px 22px rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
        }}
      >
        <Form layout="vertical" onFinish={onFinish} autoComplete="off">
          <Form.Item className='fw-bold'
            label="Topic Name"
            name="topic"
          >
            <Input placeholder="Enter topic name" />
          </Form.Item>

          <Form.Item className='fw-bold'
            label="Category"
            name="category"
          >
            <Input placeholder="Enter category" />
          </Form.Item>

          <Form.Item className='fw-bold'
            label="SubCategory"
            name="subCategory"
          >
            <Input placeholder="Enter subcategory" />
          </Form.Item>

          <Form.Item className='fw-bold'
            label="Class"
            name="class"
            rules={[{ required: true, message: 'Please select a class!' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select class(es)"
              dropdownRender={(menu) => (
                <>
                  {menu}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'nowrap',
                      padding: 8,
                    }}
                  >
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

          <Form.Item className='fw-bold'
            label="Date"
            name="date"
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item className='fw-bold'
            label="Description"
            name="description"
          >
            <ReactQuill
              value={description}
              onChange={setDescription}
              theme="snow"
              placeholder="Enter the description with formatting"
              modules={quillModules}
            />
          </Form.Item>

          <Form.Item className='fw-bold'
            label="Upload File"
            name="file"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
          >
            <Upload
              name="file"
              beforeUpload={() => false}
              accept=".jpg,.jpeg,.png,.pdf"
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" className='fw-bold' htmlType="submit" block disabled={uploading}>
              {uploading ? <LoadingOutlined /> : 'Submit'}
            </Button>
          </Form.Item>

          <Form.Item>
            <Button className='fw-bold'
              type="default"
              block
              onClick={() => navigate('/ManageProducts')}
            >
              Manage Topics
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ResponsiveForm;
