import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useFetchData = (fetchAction, selector) => {
  const dispatch = useDispatch();
  const data = useSelector(selector);

  useEffect(() => {
    dispatch(fetchAction());
  }, [dispatch, fetchAction]);

  return data;
};

export default useFetchData;