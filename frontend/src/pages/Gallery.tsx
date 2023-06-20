import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import Head from 'next/head';
import styles from '@/styles/Gallery.module.css';
import imageDescriptions from 'public/imageDescriptions.json';

type ImageType = {
  src: string;
  desc: string;
};

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<ImageType | null>(null)

  const handleImageClick = (image: ImageType) => {
    setSelectedImage(image)
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
      {imageDescriptions.map((image: ImageType, i: number) => (
        <img
          key={i}
          src={image.src}
          alt={`image-${i}`}
          className={styles.image}
          onClick={() => handleImageClick(image)}
        />
      ))}

      {selectedImage && (
        <div className={`fixed inset-0 flex items-center justify-center z-50`} onClick={handleCloseImage}>
          <div className={`relative bg-base-300 rounded-lg shadow-lg max-w-3xl mx-auto w-full max-h-screen h-auto p-6 space-y-4 overflow-auto transform transition-transform duration-200 ${selectedImage ? 'scale-100' : 'scale-0'}`}>
            <img src={selectedImage.src} alt={`selected-${selectedImage.src}`} className="max-w-full h-auto mx-auto max-h-1/2" />
            <h2 className="text-center text-2xl font-bold text-primary mb-2">Description</h2>
            <p className="text-center mb-12 text-lg">{selectedImage.desc}</p>
          </div>
        </div>

      )}
    </div>
    </Layout>
  );
}

export default Gallery;
