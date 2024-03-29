import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../styles/HomePage.module.css'; // Import the CSS module
import WebHeader from './WebHeader';
import { useNavigate } from 'react-router-dom';


const HomePage = () => {

  const navigate = useNavigate();


  function handleClick() {
    navigate('/i765');
  }

  return (
    <div className={styles.pageWrapper}>
      <WebHeader />
      <main className={styles.mainContent}>
        <h1 className={styles.title}>Fill out the forms easier</h1>
        <p className={styles.subtitle}>created by Zimo Peng</p>
        <button className={styles.getStartedButton} onClick={handleClick}>Get Started</button>
      </main>
      <footer className={styles.footer}>
        Privacy policy
        {/* Add social media icons here */}
      </footer>
    </div>
  );
};

export default HomePage;
