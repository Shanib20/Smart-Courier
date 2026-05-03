import { useEffect } from 'react';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = `SmartCourier | ${title}`;
  }, [title]);
};

export default usePageTitle;
