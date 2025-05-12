import React, { useState,useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllNews, deleteNews, updateNews } from "../../redux/modules/news";
import styles from '../../News.module.css';
import useFetchData from "../hooks/useFetchData"; // Import the custom hook

const NewsListAdmin = () => {
  const dispatch = useDispatch();
  const news = useFetchData(fetchAllNews, (state) => state.news.news); // Use useFetchData for fetching news
  const loading = useSelector((state) => state.news.loading);
  const error = useSelector((state) => state.news.error);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentNews, setCurrentNews] = useState({ _id: "", title: "", description: "" });
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error) {
      setErrorMessage(error);
    }
  }, [error]);

  const handleDelete = (id) => {
    dispatch(deleteNews(id));
  };

  const handleEdit = (newsItem) => {
    setCurrentNews(newsItem);
    setEditModalOpen(true);
    setErrorMessage(""); // Reset error message when opening the modal
  };

  const handleSave = async () => {
    try {
      await dispatch(updateNews(currentNews._id, currentNews));
      setEditModalOpen(false);
      setErrorMessage(""); // Reset error message on successful save
    } catch (error) {
      setErrorMessage("Failed to save changes. Please try again.");
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setErrorMessage(""); // Reset error message when closing the modal
  };

  return (
    <div className={`${styles.main} ${styles.newsListAdmin}`}>
      <h2>News List</h2>
      {loading && <p>Loading...</p>}
      {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      <ul>
        {news.map((item) => (
          <li key={item._id} className={styles.newsItem}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <button onClick={() => handleEdit(item)} className={styles.btn}>
              Edit
            </button>
            <button onClick={() => handleDelete(item._id)} className={styles.btnDelete}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {editModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit News</h2>
            {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
            <label>
              Title:
              <input
                type="text"
                value={currentNews.title}
                onChange={(e) =>
                  setCurrentNews({ ...currentNews, title: e.target.value })
                }
              />
            </label>
            <label>
              Description:
              <textarea
                value={currentNews.description}
                onChange={(e) =>
                  setCurrentNews({ ...currentNews, description: e.target.value })
                }
              />
            </label>
            <button onClick={handleSave} className={styles.btn}>Save</button>
            <button onClick={handleCloseModal} className={styles.btn}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsListAdmin;