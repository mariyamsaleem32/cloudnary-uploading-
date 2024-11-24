import {app,db,collection, addDoc,doc, onSnapshot, query, Timestamp} from "./firebase.js";

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
  e.preventDefault(); // prevent navigation to "#"
}, false);

urlSelect.addEventListener("click", function(e) {
  uploadFile('https://res.cloudinary.com/hzxyensd5/image/upload/sample.jpg');
  e.preventDefault(); // prevent navigation to "#"
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
  fd.append('tags', 'browser_upload'); // Optional - add tags for image admin in Cloudinary
  fd.append('file', file);

  fetch(url, {
    method: 'POST',
    body: fd,
  })
    .then((response) => response.json())
    .then(async (data) => {
      const docRef = await addDoc(collection(db, "images"), {
        timestamp: Timestamp.now(),
        name: data.display_name,
        url: data.secure_url,
        format: data.format,
        });
       console.log("Image uploaded with ID:", docRef.id);
     }).catch((error) => {
      console.error('Error uploading the file:', error);
})
}
const getData = () => {
    const q = query(collection(db, "images"));
      onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        console.log("changes", change.type);
      });
    });
  
    onSnapshot(q, (querySnapshot) => {
      const gallery = document.getElementById("gallery");
      gallery.innerHTML = '';
  
      querySnapshot.forEach((doc) => {
        const fileFormat = doc.data().format;
        const fileUrl = doc.data().url;
          const imageTransformURL = fileUrl.replace('/upload/', '/upload/w_150,c_scale/');
          if (fileUrl) {
            gallery.innerHTML += `<img src="${imageTransformURL}" />`;
          }
      });
  })
}
  getData();

// *********** Handle selected files ******************** //
const handleFiles = function(files) {
  for (let i = 0; i < files.length; i++) {
    uploadFile(files[i]); // call the function to upload the file
  }
};

window.handleFiles = handleFiles
