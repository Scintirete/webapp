import {getRequestConfig} from 'next-intl/server';
import zh from '../../messages/zh.json';
import en from '../../messages/en.json';
 
export default getRequestConfig(async ({locale}) => {
  const validLocale = locale || 'en';
  
  return {
    locale: validLocale,
    messages: validLocale === 'zh' ? zh : en
  };
});