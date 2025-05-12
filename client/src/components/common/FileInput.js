import React from 'react';

const FileInput = ({ onFileChange }) => {
  return (
    <div>
      <input 
        type="file"
        accept=".xlsx, .xls"
        onChange={(e) => onFileChange(e.target.files[0])}
      />
    </div>
  );
};

export default FileInput;
