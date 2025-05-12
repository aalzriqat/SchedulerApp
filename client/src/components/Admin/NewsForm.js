import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createNews, updateNews } from "../../redux/modules/news";
import styles from '../../News.module.css';
import useForm from "../hooks/useForm"; // Import the custom hook

const NewsForm = ({ existingNews }) => {
  const dispatch = useDispatch();
  const initialState = {
    title: existingNews ? existingNews.title : "",
    description: existingNews ? existingNews.description : "",
    image: existingNews ? existingNews.image : ""
  };

  const onSubmit = (formData, setFormError) => {
    const newsData = { title: formData.title, description: formData.description, image: formData.image };
    if (existingNews) {
      dispatch(updateNews(existingNews._id, newsData));
    } else {
      dispatch(createNews(newsData));
    }
    setIsModalOpen(false); // Close the modal after submission
  };

  const { formData, handleChange, handleSubmit } = useForm(initialState, onSubmit);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange({ target: { name: "image", value: reader.result } });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <button onClick={() => setIsModalOpen(true)}>
        {existingNews ? "Edit News" : "Create News"}
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <form onSubmit={handleSubmit} className={styles.newsFormAdmin}>
              <h2>{existingNews ? "Edit News" : "Create News"}</h2>
              <div className={styles.formGroup}>
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What's the title?"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                />
                <label className={styles.imageUpload}>
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <i className="fas fa-camera"></i>
                </label>
              </div>
              <button type="submit" className={styles.btnSubmit}>
                {existingNews ? "Update" : "Create"}
              </button>
              <button type="button" className={styles.btnClose} onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsForm;