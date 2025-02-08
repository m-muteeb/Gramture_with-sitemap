import React, { useState, useEffect } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, Select, DatePicker, Upload } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { fireStore } from '../../firebase/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import moment from 'moment';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [fileList, setFileList] = useState([]); // To store files selected for upload
  const [form] = Form.useForm();
  const [description, setDescription] = useState(''); // Store the description with HTML content
  const [loading, setLoading] = useState(false); // Global loader state
  const [deleting, setDeleting] = useState(false); // Loader for delete action
  const storage = getStorage();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const q = query(collection(fireStore, 'topics'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Check if fileURL exists and format them properly as an array of objects
      const formattedProductList = productList.map(product => {
        if (product.fileURL) {
          // If it's a string, make it an array with an object structure { name, url }
          if (typeof product.fileURL === 'string') {
            return {
              ...product,
              fileURL: [{ name: 'file', url: product.fileURL }],
            };
          }
          // If it's already an array of objects, leave it as is
          else if (Array.isArray(product.fileURL)) {
            return {
              ...product,
              fileURL: product.fileURL.map(file => ({
                name: file.name || 'file',
                url: file.url,
              })),
            };
          }
        }
        return product;
      });

      setProducts(formattedProductList);
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
    setDescription(record.description || ''); // Set description to HTML content
    form.setFieldsValue({
      topic: record.topic,
      class: record.class,
      subCategory: record.subCategory,
      description: record.description || '',
      date: record.date ? moment(record.date) : null,
    });
    setIsModalVisible(true);
    // Set fileList to show in the modal
    setFileList(record.fileURL || []);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDescription('');
    form.resetFields();
    setFileList([]);
    setLoading(false);
  };

  const uploadFile = async (file) => {
    const storageRef = ref(storage, `files/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      // Upload multiple files
      const fileUrls = await Promise.all(fileList.map(file => uploadFile(file)));

      const updatedValues = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD HH:mm:ss') : '',
        description: description, // Save the description with HTML formatting
        timestamp: serverTimestamp(),
      };

      // If files were uploaded, add them to the update data
      if (fileUrls.length > 0) {
        updatedValues.fileURL = fileUrls.map((url, index) => ({
          name: fileList[index].name,
          url: url,
        }));
      } else if (editingProduct.fileURL) {
        updatedValues.fileURL = editingProduct.fileURL;
      }

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

  const columns = [
    { title: 'Topic', dataIndex: 'topic', key: 'topic' },
    { title: 'Class', dataIndex: 'class', key: 'class' },
    { title: 'SubCategory', dataIndex: 'subCategory', key: 'subCategory' },
    { title: 'Date', dataIndex: 'date', key: 'date' },
    {
      title: 'File',
      dataIndex: 'fileURL',
      key: 'fileURL',
      render: (fileURL) => {
        if (!fileURL || fileURL.length === 0) {
          return 'No File'; // Show 'No File' when no files exist
        }

        const files = Array.isArray(fileURL) ? fileURL : [fileURL];
        return files.map((file, index) => (
          <div key={index}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              {file.name || `File ${index + 1}`} 
            </a>
          </div>
        ));
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button
            icon={<EditOutlined />}
            style={{ margin: 3, color: 'green' }}
            onClick={() => handleEdit(record)}
            loading={loading}
          />
          <Popconfirm title="Are you sure to delete this product?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button
              style={{ color: 'red', margin: 3 }}
              icon={<DeleteOutlined />}
              danger
              loading={deleting}
            />
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="container">
      <h2 className="text-center py-5">Manage Products</h2>
      <Table dataSource={products} columns={columns} rowKey="id" bordered />
      <Modal
        title="Edit Product"
        visible={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
        width={1000}  
        className="responsive-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleUpdate} className="responsive-form">
          <Form.Item label="Topic" name="topic">
            <Input placeholder="Enter topic" />
          </Form.Item>

          <Form.Item label="Class" name="class">
            <Select placeholder="Select class">
              <Select.Option value="10">10</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="SubCategory" name="subCategory">
            <Input placeholder="Enter subcategory" />
          </Form.Item>

          <Form.Item label="Date" name="date">
            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" placeholder="Select date and time" />
          </Form.Item>

          <Form.Item label="Description">
            <ReactQuill
              value={description}  // Pass the HTML content directly
              onChange={setDescription}
              theme="snow"
              className="responsive-quill"
            />
          </Form.Item>

          <Form.Item label="Upload Files">
            <Upload
              fileList={fileList}
              beforeUpload={(file) => {
                setFileList((prev) => [...prev, file]);
                return false; // Prevent auto-upload
              }}
              multiple
              onRemove={(file) => {
                setFileList((prev) => prev.filter((item) => item.uid !== file.uid));
              }}
              className="responsive-upload"
            >
              <Button>Select Files</Button>
            </Upload>
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
