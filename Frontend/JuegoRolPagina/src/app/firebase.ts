import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDVRTy8pr_nAV0xMzZ6_oS7lruM58mRi5s',
  authDomain: 'juegorol-b3430.firebaseapp.com',
  projectId: 'juegorol-b3430',
  storageBucket: 'juegorol-b3430.firebasestorage.app',
  messagingSenderId: '232518335443',
  appId: '1:232518335443:web:5422e44d0d5931dd284d26',
  measurementId: 'G-0F2KL0HW0B',
};



const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
