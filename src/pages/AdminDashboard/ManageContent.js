import React, { useState, useEffect, useRef } from 'react';
import { Table, Button, Popconfirm, message, Modal, Form, Input, Select, Row, Col } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { fireStore } from '../../firebase/firebase';
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
  const [mcqs, setMcqs] = useState([]); // To store the MCQs of the product
  const editor = useRef(null);

  // Debounced function to optimize the writing experience
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
    setMcqs(record.mcqs || []); // Set the MCQs for the product
    form.setFieldsValue({
      topic: record.topic,
      class: record.class,
      subCategory: record.subCategory,
      description: record.description || '',
    });
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setDescription('');
    setMcqs([]); // Clear MCQs when closing the modal
    form.resetFields();
    setLoading(false);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updatedValues = {
        ...values,
        description, // Save the description with HTML formatting
        mcqs, // Save the updated MCQs
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
      { question: '', options: ['', '', '', ''], correctAnswer: '' },
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
    { title: 'Action', key: 'action', render: (_, record) => (
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

  const joditConfig = {
    readonly: false,
    height: 400,
    caretColor: 'black',
    uploader: {
      insertImageAsBase64URI: true,
    },
    buttons: [
      'source', '|',
      'bold', 'italic', 'underline', 'strikethrough', '|',
      'superscript', 'subscript', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'align', '|',
      'undo', 'redo', '|',
      'cut', 'copy', 'paste', '|',
      'link', 'image', 'video', 'table', '|',
      'hr', 'symbol', 'fullsize', '|',
      'print', 'about'
    ],
  };

  const handleDescriptionChange = (newContent) => {
    debouncedDescriptionChange.current(newContent);
  };

  return (
    <div className="container" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2 className="text-center py-5" style={{ textAlign: 'center', paddingBottom: '20px' }}>Manage Products</h2>
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
              {classes.map((classOption) => (
                <Select.Option key={classOption.id} value={classOption.name}>
                  {classOption.name}
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
              style={{
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                padding: '10px',
                fontFamily: 'Arial, sans-serif',
                fontSize: '14px',
                lineHeight: '1.5',
                minHeight: '150px',
                overflowY: 'auto',
              }}
            />
          </Form.Item>

          <Form.Item label="MCQs">
            {mcqs.map((mcq, index) => (
              <Row key={index} gutter={[16, 16]} style={{ marginBottom: '16px' }}>
                <Col span={24}>
                  <Input
                    placeholder={`Question ${index + 1}`}
                    value={mcq.question}
                    onChange={(e) => handleMCQChange(index, 'question', e.target.value)}
                  />
                </Col>
                {mcq.options.map((option, optIndex) => (
                  <Col span={12} key={optIndex}>
                    <Input
                      placeholder={`Option ${optIndex + 1}`}
                      value={option}
                      onChange={(e) => {
                        const updatedOptions = [...mcq.options];
                        updatedOptions[optIndex] = e.target.value;
                        handleMCQChange(index, 'options', updatedOptions);
                      }}
                    />
                  </Col>
                ))}
                <Col span={12}>
                  <Input
                    placeholder="Correct Answer"
                    value={mcq.correctAnswer}
                    onChange={(e) => handleMCQChange(index, 'correctAnswer', e.target.value)}
                  />
                </Col>
                <Col span={24}>
                  <Button danger onClick={() => handleDeleteMCQ(index)}>
                    Delete MCQ
                  </Button>
                </Col>
              </Row>
            ))}
            <Button onClick={handleAddMCQ}>Add MCQ</Button>
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
