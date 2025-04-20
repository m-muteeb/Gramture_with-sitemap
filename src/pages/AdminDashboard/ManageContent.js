import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, Select, Row, Col, Upload, Image } from 'antd';
import { EditOutlined, DeleteOutlined, UploadOutlined , PlusOutlined} from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { fireStore, storage } from '../../firebase/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import JoditEditor from 'jodit-react';
import { debounce } from 'lodash';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form] = Form.useForm();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [mcqs, setMcqs] = useState([]);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const editor = useRef(null);

  const debouncedDescriptionChange = useRef(
    debounce((newContent) => {
      setDescription(newContent);
    }, 300)
  );

  useEffect(() => {
    fetchProducts();
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const querySnapshot = await getDocs(collection(fireStore, 'classes'));
      const classList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClasses(classList);
    } catch (error) {
      message.error('Failed to fetch classes.');
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    try {
      const q = query(collection(fireStore, 'topics'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList);
    } catch (error) {
      message.error('Failed to fetch products.');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteDoc(doc(fireStore, 'topics', id));
      message.success('Product deleted successfully!');
      setProducts((prev) => prev.filter((product) => product.id !== id));
    } catch (error) {
      message.error('Failed to delete product.');
      console.error(error);
    } finally {
      setDeleting(false);
    }
  };

  const handleEdit = (record) => {
    setEditingProduct(record);
    setDescription(record.description || '');
    setMcqs(record.mcqs || []);
    setFeaturedImage(record.featuredImage || null);
    form.setFieldsValue({
      topic: record.topic,
      class: record.class,
      subCategory: record.subCategory,
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDescription('');
    setMcqs([]);
    setFeaturedImage(null);
    form.resetFields();
    setLoading(false);
  };

  const uploadFeaturedImage = async (file) => {
    setImageUploading(true);
    try {
      // Delete old image if exists
      if (featuredImage) {
        try {
          const oldImageRef = ref(storage, featuredImage);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      const uniqueFileName = `${Date.now()}-${file.name}`;
      const storageRef = ref(storage, `featured-images/${uniqueFileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          null,
          (error) => {
            console.error('Image upload failed:', error);
            message.error('Featured image upload failed.', 3);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setFeaturedImage(downloadURL);
            message.success('Featured image uploaded successfully!', 3);
            resolve(downloadURL);
          }
        );
      });
    } catch (error) {
      console.error('Error uploading featured image:', error);
      message.error('Error uploading featured image', 3);
      return null;
    } finally {
      setImageUploading(false);
    }
  };

  const handleImageUpload = async (options) => {
    const { file } = options;
    try {
      const url = await uploadFeaturedImage(file);
      return url;
    } catch (error) {
      console.error('Image upload error:', error);
      return null;
    }
  };

  const handleRemoveImage = () => {
    setFeaturedImage(null);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedValues = {
        ...values,
        description,
        mcqs,
        featuredImage,
        timestamp: serverTimestamp(),
      };

      await updateDoc(doc(fireStore, 'topics', editingProduct.id), updatedValues);
      message.success('Product updated successfully!');
      handleModalClose();
      fetchProducts();
    } catch (error) {
      message.error('Failed to update product.');
      console.error(error);
      setLoading(false);
    }
  };

  const handleMCQChange = (index, field, value) => {
    const updatedMcqs = [...mcqs];
    updatedMcqs[index][field] = value;
    setMcqs(updatedMcqs);
  };

  const handleAddMCQ = () => {
    setMcqs([
      ...mcqs,
      { question: '', options: ['', '', '', ''], correctAnswer: '', logic: '' },
    ]);
  };

  const handleDeleteMCQ = (index) => {
    const updatedMcqs = mcqs.filter((_, idx) => idx !== index);
    setMcqs(updatedMcqs);
  };

  const columns = [
    { title: 'Topic', dataIndex: 'topic', key: 'topic' },
    { title: 'Class', dataIndex: 'class', key: 'class' },
    { title: 'SubCategory', dataIndex: 'subCategory', key: 'subCategory' },
    {
      title: 'Featured Image',
      key: 'featuredImage',
      render: (_, record) => (
        record.featuredImage ? (
          <Image
            src={record.featuredImage}
            width={50}
            height={50}
            style={{ objectFit: 'cover' }}
            preview={{
              src: record.featuredImage,
            }}
          />
        ) : 'No Image'
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button icon={<EditOutlined />} style={{ margin: 3, color: 'green' }} onClick={() => handleEdit(record)} loading={loading} />
          <Popconfirm title="Are you sure to delete this product?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button style={{ color: 'red', margin: 3 }} icon={<DeleteOutlined />} danger loading={deleting} />
          </Popconfirm>
        </>
      ),
    },
  ];

  const joditConfig = {
    readonly: false,
    height: 400,
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'ul', 'ol', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'align', 'outdent', 'indent', '|',
      'cut', 'copy', 'paste', 'copyformat', '|',
      'hr', 'table', 'link', '|',
      'undo', 'redo', '|',
      'preview', 'print', 'find', 'fullsize',
      'image', 'video', 'file'
    ],
    uploader: {
      insertImageAsBase64URI: true,
      url: '/api/upload',
      format: 'json',
      imagesExtensions: ['jpg', 'png', 'jpeg', 'gif'],
      filesVariableName: 'files',
      withCredentials: false,
      prepareData: (data) => {
        const formData = new FormData();
        Object.keys(data).forEach((key) => {
          formData.append(key, data[key]);
        });
        return formData;
      },
      isSuccess: (resp) => resp.success,
      getMessage: (resp) => resp.message,
      process: (resp) => ({
        files: resp.files || [],
        path: resp.path || '',
        baseurl: resp.baseurl || '',
        error: resp.error || 0,
        message: resp.message || ''
      }),
      error: (e) => {
        console.error('Upload error:', e);
        message.error('Image upload failed');
      },
      defaultHandlerSuccess: (data) => {
        const { files } = data;
        if (files && files.length) {
          return files[0];
        }
        return '';
      }
    },
    imageDefaultWidth: 300,
    imagePosition: 'center',
    spellcheck: true,
    toolbarAdaptive: false,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: true,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    allowTabNavigtion: false,
    placeholder: 'Type your content here...'
  };

  const handleDescriptionChange = (newContent) => {
    debouncedDescriptionChange.current(newContent);
  };

  const beforeImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
    }
    return isImage && isLt5M;
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <h2 style={{ textAlign: 'center', paddingBottom: '20px' }}>Manage Products</h2>
      <Table 
        dataSource={products} 
        columns={columns} 
        rowKey="id" 
        bordered
        scroll={{ x: true }}
      />

<Modal
  title="Edit Product"
  open={isModalVisible}
  onCancel={handleModalClose}
  footer={null}
  width={1000}
  style={{ 
    marginTop: '70px',
    zIndex: 50000000000000000000,
   
  }}
 
>
        <Form form={form} layout="vertical" onFinish={handleUpdate} >
          <Form.Item label="Featured Image">
            <Upload
              name="featuredImage"
              customRequest={handleImageUpload}
              beforeUpload={beforeImageUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={imageUploading}>
                Change Featured Image
              </Button>
            </Upload>
            {featuredImage && (
              <div style={{ marginTop: 16 }}>
                <Image
                  src={featuredImage}
                  width={200}
                  style={{ maxHeight: 200, objectFit: 'contain' }}
                  alt="Featured Preview"
                />
                <Button
                  type="link"
                  danger
                  onClick={handleRemoveImage}
                  style={{ marginLeft: 8 }}
                >
                  Remove Image
                </Button>
              </div>
            )}
          </Form.Item>

          <Form.Item label="Topic" name="topic" rules={[{ required: true, message: 'Please enter topic name!' }]}>
            <Input placeholder="Enter topic" />
          </Form.Item>

          <Form.Item label="Class" name="class" rules={[{ required: true, message: 'Please select a class!' }]}>
            <Select placeholder="Select class">
              {classes.map((cls) => (
                <Select.Option key={cls.id} value={cls.name}>
                  {cls.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="SubCategory" name="subCategory">
            <Input placeholder="Enter subcategory" />
          </Form.Item>

          <Form.Item label="Description">
            <JoditEditor
              ref={editor}
              value={description}
              config={joditConfig}
              onBlur={(newContent) => setDescription(newContent)}
              onChange={handleDescriptionChange}
            />
          </Form.Item>

          <Form.Item label="MCQs">
            {mcqs.map((mcq, index) => (
              <div key={index} style={{ border: '1px solid #d9d9d9', borderRadius: '8px', padding: '16px', marginBottom: '16px' }}>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>Question {index + 1}</strong>
                      <Button danger onClick={() => handleDeleteMCQ(index)} size="small">
                        Delete
                      </Button>
                    </div>
                    <JoditEditor
                      value={mcq.question}
                      config={{
                        ...joditConfig,
                        height: 150,
                        buttons: 'bold,italic,underline,strikethrough,ul,ol,font,fontsize,brush,paragraph,align,link,image'
                      }}
                      onBlur={(newContent) => handleMCQChange(index, 'question', newContent)}
                    />
                  </Col>

                  {mcq.options.map((option, optIndex) => (
                    <Col span={12} key={optIndex}>
                      <Input
                        addonBefore={
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={mcq.correctAnswer === option}
                            onChange={() => handleMCQChange(index, 'correctAnswer', option)}
                          />
                        }
                        placeholder={`Option ${optIndex + 1}`}
                        value={option}
                        onChange={(e) => {
                          const updatedOptions = [...mcq.options];
                          const oldOption = updatedOptions[optIndex];
                          updatedOptions[optIndex] = e.target.value;
                          handleMCQChange(index, 'options', updatedOptions);

                          if (mcq.correctAnswer === oldOption) {
                            handleMCQChange(index, 'correctAnswer', e.target.value);
                          }
                        }}
                      />
                    </Col>
                  ))}

                  {mcq.correctAnswer && (
                    <Col span={24}>
                      <JoditEditor
                        value={mcq.logic}
                        config={{
                          ...joditConfig,
                          height: 100,
                          buttons: 'bold,italic,underline,strikethrough,ul,ol,font,fontsize,brush,paragraph,align,link'
                        }}
                        onBlur={(newContent) => handleMCQChange(index, 'logic', newContent)}
                      />
                    </Col>
                  )}
                </Row>
              </div>
            ))}
            <Button type="dashed" onClick={handleAddMCQ}>
              Add MCQ
            </Button>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Update
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageProducts;