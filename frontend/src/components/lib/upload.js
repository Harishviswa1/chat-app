import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export const upload=async(file)=>{
    const storage = getStorage();


const metadata = {
  contentType:file.type
};

const date=new Date();
const storageRef = ref(storage, `images/${date+file.name}`);
const uploadTask = uploadBytesResumable(storageRef, file, metadata);

return new Promise((resolve,reject)=>{
    uploadTask.on('state_changed',
        (snapshot) => {
        
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload is ' + progress + '% done');
          switch (snapshot.state) {
            case 'paused':
              console.log('Upload is paused');
              break;
            case 'running':
              console.log('Upload is running');
              break;
          }
        }, 
        (error) => {
          reject("Something went wrong"+error);
        }, 
        () => {
      
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
});

}
