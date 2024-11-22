import { db, collection, addDoc, doc, onSnapshot, query, Timestamp } from "./firebase.js";

const cloudName = 'dml17obhm';
const unsignedUploadPreset = 'ml_default';

const fileSelect = document.getElementById("fileSelect");
const fileElem = document.getElementById("fileElem");
const urlSelect = document.getElementById("urlSelect");
const dropbox = document.getElementById("dropbox");

fileSelect.addEventListener("click", function(e) {
  if (fileElem) {
    fileElem.click();
  }
  e.preventDefault();
}, false);

urlSelect.addEventListener("click", function(e) {
  uploadFile('https://res.cloudinary.com/hzxyensd5/image/upload/sample.jpg');
  e.preventDefault();
}, false);

// ************************ Drag and drop ***************** //
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  const dt = e.dataTransfer;
  const files = dt.files;

  handleFiles(files);
}

// *********** Upload file to Cloudinary ******************** //
function uploadFile(file) {
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const fd = new FormData();
  fd.append('upload_preset', unsignedUploadPreset);
  fd.append('tags', 'browser_upload');
  fd.append('file', file);

  fetch(url, {
    method: 'POST',
    body: fd,
  })
    .then((response) => response.json())
    .then(async(data) => {
      console.log("data", data);
      const docRef = await addDoc(collection(db, "images"), {
        timestamp: Timestamp.now(),
        name: data.display_name,
        url: data.secure_url,
      });
      console.log("ID is :", docRef.id);
    })
    .catch((error) => {
      console.error('Error uploading the file:', error);
    });
}

const getData = () => {
    const q = query(collection(db, "images"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log("changes", change.type);
      });
    });
  
    onSnapshot(q, (querySnapshot) => {
      // Empty the gallery before adding new images
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = '';
  
      querySnapshot.forEach((doc) => {
        const imageUrl = doc.data().url;
  
        // Apply transformation to the URL
        const transformURL = imageUrl.replace('/upload/', '/upload/w_150,c_scale/');
  
        if (imageUrl) {
          gallery.innerHTML += `<img src="${transformURL}" />`; // Use transformed URL
        }
        console.log("doc data is", doc.data());
      });
    });
  }
getData();

// *********** Handle selected files ******************** //
const handleFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    uploadFile(files[i]);
  }
};

window.handleFiles = handleFiles;
