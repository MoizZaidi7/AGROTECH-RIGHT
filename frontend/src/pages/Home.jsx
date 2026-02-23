import React, { useState } from 'react';
import TranslateButton from '../components/translateButton';
import axios from 'axios';

const Home = () => {
  const [translated, setTranslated] = useState('');
  const content = "Welcome to AgroTech! Our mission is to empower farmers.";

  const handleTranslate = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/translate', {
        text: content,
      });
      setTranslated(res.data.translated);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <TranslateButton onClick={handleTranslate} />
      <p className="mt-4 text-lg">
        {translated || content}
      </p>
    </div>
  );
};

export default Home;
