import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllNews } from "../../redux/modules/news";
import styles from '../../News.module.css';

const NewsListClient = () => {
  const dispatch = useDispatch();
  const { news, loading, error } = useSelector((state) => state.news);

  useEffect(() => {
    dispatch(fetchAllNews());
  }, [dispatch]);

  return (
    <div className={`${styles.main} ${styles.newsListClient}`}>
      <h2 className={styles.h2}>News List</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      <ul>
        {news && news.map((item) => (
          <li key={item._id} className={styles.newsItem}>
            <h3 className={styles.h3}>{item.title}</h3>
            <p className={styles.p}>{item.description}</p>
            <button className={styles.btn}>Read More</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NewsListClient;