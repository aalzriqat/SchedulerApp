import { useState } from 'react';

const useForm = (initialState, onSubmit) => {
  const [formData, setFormData] = useState(initialState);
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData, setFormError);
  };

  return { formData, formError, handleChange, handleSubmit, setFormError };
};

export default useForm;