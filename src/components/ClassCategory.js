import React, { useState, useEffect } from 'react';
import { Collapse } from 'react-bootstrap';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import 'bootstrap/dist/css/bootstrap.min.css';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { fireStore } from '../firebase/firebase'; // Ensure this path points to your Firebase configuration
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const DropdownComponent = () => {
  const [openDropdown, setOpenDropdown] = useState(null); // Track which main dropdown is open
  const [openCategory, setOpenCategory] = useState({}); // Track which category dropdown is open
  const [dropdownData, setDropdownData] = useState([]); // Dynamic data

  // Fetch dropdown data from Firestore
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        if (!fireStore) throw new Error('Firestore instance is not defined');
        
        // Adjust query to order subCategories by a field, e.g., 'timestamp'
        const querySnapshot = await getDocs(
          query(collection(fireStore, 'topics'), orderBy('timestamp')) // Assuming 'timestamp' is the field to order by
        );

        const data = {};

        querySnapshot.forEach((doc) => {
          const { class: className, category, subCategory, timestamp } = doc.data();
          // Only include classes 9, 10, 11, and 12
          if (['Class 9', 'Class 10', 'Class 11', 'Class 12'].includes(className)) {
            if (!data[className]) {
              data[className] = {};
            }
            if (!data[className][category]) {
              data[className][category] = [];
            }
            // Add subcategory in correct order (since we ordered them by 'timestamp')
            data[className][category].push({ subCategory, timestamp });
          }
        });

        const formattedData = Object.keys(data).map((classKey) => ({
          title: classKey,
          content: Object.keys(data[classKey]).map((categoryKey) => ({
            category: categoryKey,
            subCategories: data[classKey][categoryKey].sort((a, b) => a.timestamp - b.timestamp), // Sort by timestamp
          })),
        }));

        setDropdownData(formattedData);
      } catch (error) {
        console.error('Error fetching dropdown data:', error);
      }
    };

    fetchDropdownData();
  }, []);

  const toggleDropdown = (index) => {
    setOpenDropdown(openDropdown === index ? null : index);
  };

  const toggleCategory = (mainIndex, categoryIndex) => {
    const key = `${mainIndex}-${categoryIndex}`;
    setOpenCategory((prevState) => ({
      ...prevState,
      [key]: !prevState[key],
    }));
  };

  return (
    <div className="container">
      <h2 className="text-center mt-4">Study Online - For FREE</h2>
      <p className="text-center text-muted mb-4">
        Free Video Lectures, Practice MCQs & Test Sessions
      </p>
      <div className="row justify-content-center">
        {dropdownData.map((dropdown, index) => (
          <div className="col-md-6 mb-3" key={index}>
            <div
              className="p-3 border rounded"
              style={{ cursor: 'pointer', backgroundColor: '#f8f9fa' }}
              onClick={() => toggleDropdown(index)}
            >
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h5>{dropdown.title}</h5>
                {openDropdown === index ? <BsChevronUp /> : <BsChevronDown />}
              </div>
              <Collapse in={openDropdown === index}>
                <div className="mt-2">
                  {dropdown.content.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="mb-3">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent the category click from toggling the main dropdown
                          toggleCategory(index, categoryIndex);
                        }}
                      >
                        <h6>{category.category}</h6>
                        {openCategory[`${index}-${categoryIndex}`] ? (
                          <BsChevronUp />
                        ) : (
                          <BsChevronDown />
                        )}
                      </div>
                      <Collapse in={openCategory[`${index}-${categoryIndex}`]}>
                        <ul className="list-unstyled mt-2 pl-4">
                          {category.subCategories.map((subCategory, subIdx) => (
                            <li key={subIdx} className="py-1">
                              {/* Link to the Description component with the subCategory as a URL parameter */}
                              <Link
                                to={`/description/${subCategory.subCategory}`} // Adjust link to pass the correct subCategory name
                                style={{ textDecoration: 'none', color: 'black' }}
                              >
                                {subCategory.subCategory}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                    </div>
                  ))}
                </div>
              </Collapse>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DropdownComponent;
