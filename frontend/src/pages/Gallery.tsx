import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { NextPage } from 'next';
import Head from 'next/head';
import styles from '@/styles/Gallery.module.css';


const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null)

  const handleImageClick = (e: any) => {
    setSelectedImage(e.target.src)
  }

  const handleCloseImage = (e: any) => {
    if (e.target === e.currentTarget) {
      setSelectedImage(null);
    }
  }
  return (
    <Layout>
      <Head>
        <title>Gallery Page</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className={styles.gallery}>
      {Array.from({length: 36}, (_, i) => `/images/image${i + 1}.png`).map((src, i) => (
        <img
          key={i}
          src={src}
          alt={`image-${i}`}
          className={styles.image}
          onClick={handleImageClick}
        />
      ))}

      {selectedImage && (
        
        <div className={styles.popup} onClick={handleCloseImage}>
          <div className={`${styles.popupContent} items-center justify-center  border-base-300 bg-base-100`}
>
            <img
              src={selectedImage}
              alt={`selected-${selectedImage}`}
              className={styles.selectedImage}
            />
            {/* <h2 className={styles.descriptionTitle}>Description</h2>
            <p className={styles.descriptionText}>This is the description for the selected image.</p> */}
          </div>
        </div>
      )}
    </div>
    </Layout>
  );
}

export default Gallery;
