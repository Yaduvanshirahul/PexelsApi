console.log(firebase); // Should log the Firebase namespace object
// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBT2_NIV3KryayLXOH2scQy57Sk9A8uo6c",
  authDomain: "pixels-clone-fb1a9.firebaseapp.com",
  projectId: "pixels-clone-fb1a9",
  storageBucket: "pixels-clone-fb1a9.appspot.com",
  messagingSenderId: "1049853359440",
  appId: "1:1049853359440:web:0377bb41c6fecec31a6855",
 // measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let pics = document.querySelector(".pics");
let loadBtn = document.querySelector('.load');
let searchInput = document.querySelector('#searchInput');
let currentPage = 1;
let perPage = 12;
let searchTerm = null;
// console.log(`jay shree ram`);
let apiLink = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;
const apiKey = "ApJwZN2PsU5Kq6I60JzfI2fVkdgOhqkQ5N2quxwSQaPNfTAc5T1jVNpj";

const downloadImg = (imgdownload) => {
    fetch(imgdownload).then(res => res.blob()).then(blob => {
        let anchor = document.createElement('a');
        anchor.href = URL.createObjectURL(blob);
        anchor.download = new Date().getTime();
        anchor.click();
    });
};

const genratePics = (img) => {
  console.log(img);
  pics.innerHTML += img.map(
    (picdata) =>
      `<li class="pic_list">
        <img src="${picdata.src.large2x}" alt="" />

        <div class="details">
          <div class="top_details_header">
            <button><i class="fa fa-clone" aria-hidden="true"></i></button>
            <button><i class="fa fa-heart-o" aria-hidden="true"></i></button>
          </div>
          <div class="bottom_details_header">
            <div class="shooter">
              <img src="${picdata.src.large2x}" alt="">
              <h6>${picdata.photographer}</h6>
            </div>
            <button onclick="downloadImg('${picdata.src.large2x}')"><i class="fa fa-download" aria-hidden="true"></i></button>
          </div>
        </div>
      </li>`
  );
};

// Function to display uploaded images from Firestore
const displayUploadedImages = () => {
  db.collection('uploadedImages')
      .orderBy('timestamp', 'desc') // Optional: Sort by timestamp
      .get()
      .then((snapshot) => {
          snapshot.forEach((doc) => {
              const imgData = doc.data();
              const imgElement = document.createElement('li');
              imgElement.classList.add('pic_list'); // Use existing class for styling
              imgElement.innerHTML = `
                  <img src="${imgData.url}" alt="User Uploaded Image" />
                  <div class="details">
                      <div class="top_details_header">
                          <button><i class="fa fa-clone" aria-hidden="true"></i></button>
                          <button><i class="fa fa-heart-o" aria-hidden="true"></i></button>
                      </div>
                      <div class="bottom_details_header">
                          <div class="shooter">
                              <img src="images/profileimg.png" alt="">
                              <h6>${imgData.userId}</h6> <!-- Display the user ID or username -->
                          </div>
                          <button onclick="downloadImg('${imgData.url}')"><i class="fa fa-download" aria-hidden="true"></i></button>
                      </div>
                  </div>
              `;
              pics.prepend(imgElement); // Add the new image to the top
          });
      })
      .catch((error) => {
          console.error('Error fetching images:', error);
      });
};

// Define the getImages function
const getImages = (img) => {
  fetch(img, { headers: { Authorization: apiKey } })
    .then((res) => res.json())
    .then((result) => genratePics(result.photos));
};

getImages(apiLink);

loadBtn.addEventListener('click', () =>{
    currentPage++;
    let apiurl = `https://api.pexels.com/v1/curated?page=${currentPage}&per_page=${perPage}`;

    apiurl = searchTerm ? `https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}` : apiurl;
    getImages(apiurl);
})

searchInput.addEventListener('keyup',(e)=>{

    if(e.target.value === ""){
        return null;
    }

   if(e.key === "Enter"){
    currentPage = 1;
    pics.innerHTML = "";
    searchTerm = e.target.value;
    let searchApi = `https://api.pexels.com/v1/search?query=${searchTerm}&page=1&per_page=${perPage}`;
    getImages(searchApi);
    e.target.value ="";
   }

})

// ===================== Authentication Logic Starts Here ===================== //

// Authentication Modal Elements
const authModal = document.getElementById('authModal');
const closeModal = document.querySelector('.close');
const authForm = document.getElementById('authForm');
const authButton = document.getElementById('authButton');
const authToggle = document.getElementById('authToggle');
const toggleLogin = document.getElementById('toggleLogin');

let isLogin = true; // Toggle between Login and Signup

// Open Modal when clicking the profile button
const profileButton = document.querySelector('.profile');
profileButton.addEventListener('click', () => {
  authModal.style.display = 'block';
});

// Close Modal when clicking the close icon
closeModal.addEventListener('click', () => {
  authModal.style.display = 'none';
});

// Toggle between Login and Signup
toggleLogin.addEventListener('click', () => {
  isLogin = !isLogin;
  authButton.textContent = isLogin ? 'Login' : 'Signup';
  authToggle.innerHTML = isLogin
    ? `Don't have an account? <span id="toggleLogin">Signup</span>`
    : `Already have an account? <span id="toggleLogin">Login</span>`;
});

// Handle Form Submission for Login/Signup
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  if (isLogin) {
    // Login Existing User
    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        console.log('Logged in as:', user.email);
        authModal.style.display = 'none';
      })
      .catch((error) => {
        console.error('Error logging in:', error.message);
        alert(error.message);
      });
  } else {
    // Signup New User
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        // Signed up
        const user = userCredential.user;
        console.log('Signed up as:', user.email);
        authModal.style.display = 'none';
      })
      .catch((error) => {
        console.error('Error signing up:', error.message);
        alert(error.message);
      });
  }
});

// Monitor Auth State Changes
auth.onAuthStateChanged((user) => {
  if (user) {
      console.log('User is logged in:', user.email);
      document.querySelector('.upload').style.display = 'block'; // Show upload button
      logoutButton.style.display = 'block'; // Show logout button
  } else {
      console.log('No user is logged in.');
      document.querySelector('.upload').style.display = 'none'; // Hide upload button
      logoutButton.style.display = 'none'; // Hide logout button
  }
});

// Logout functionality
logoutButton.addEventListener('click', () => {
  auth.signOut().then(() => {
      console.log('User logged out.');
  }).catch((error) => {
      console.error('Error logging out:', error);
  });
});

// Close Modal When Clicking Outside the Modal Content
window.addEventListener('click', (event) => {
  if (event.target == authModal) {
    authModal.style.display = 'none';
  }
});

// ===================== Authentication Logic Ends Here ===================== //

// ===================== Image Upload Integration (E. Part) ===================== //

// Image Upload Elements
const uploadButton = document.querySelector('.upload');
const imageUpload = document.getElementById('imageUpload');

// Handle Upload Button Click
uploadButton.addEventListener('click', () => {
  const user = auth.currentUser;
  if (!user) {
    alert('Please log in to upload images.');
    authModal.style.display = 'block';
    return;
  }
  imageUpload.click(); // Trigger the hidden file input
});

// Handle Image Selection and Upload
imageUpload.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) {
    alert('User not authenticated.');
    return;
  }

  const storageRef = storage.ref();
  const imagesRef = storageRef.child(`images/${user.uid}/${file.name}`);

  const uploadTask = imagesRef.put(file);

  uploadTask.on(
    'state_changed',
    (snapshot) => {
      // Optional: Implement a progress bar
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      console.log(`Upload is ${progress}% done`);
    },
    (error) => {
      console.error('Error uploading image:', error);
      alert('Error uploading image.');
    },
    () => {
      // Upload completed successfully
      uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
        console.log('File available at', downloadURL);
        // Save image metadata to Firestore
        db.collection('uploadedImages').add({
          url: downloadURL,
          userId: user.uid,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          // Add more metadata if needed
        });
        alert('Image uploaded successfully!');
        // Optionally, display the uploaded image immediately
        const imgElement = document.createElement('li'); // Use <li> for consistency
        imgElement.classList.add('pic_list'); // Add existing classes for styling
        imgElement.innerHTML = `
          <img src="${downloadURL}" alt="User Uploaded Image" />

          <div class="details">
            <div class="top_details_header">
              <button><i class="fa fa-clone" aria-hidden="true"></i></button>
              <button><i class="fa fa-heart-o" aria-hidden="true"></i></button>
            </div>
            <div class="bottom_details_header">
              <div class="shooter">
                <img src="images/profileimg.png" alt="">
                <h6>${user.email}</h6>
              </div>
              <button onclick="downloadImg('${downloadURL}')"><i class="fa fa-download" aria-hidden="true"></i></button>
            </div>
          </div>
        `;
        pics.prepend(imgElement); // Add the new image to the top
      });
    }
  );
});

// ===================== Image Upload Integration Ends Here ===================== //

