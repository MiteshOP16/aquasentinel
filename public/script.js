
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
// For header 

let menu = document.querySelector('#menu-btn');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
} 

// for window scroll 

window.onscroll = () =>{
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');

    if(window.scrollY > 0){
        document.querySelector('.header').classList.add('active');
    }else{
        document.querySelector('.header').classList.remove('active');
    }

}


window.onload = () =>{
  if(window.scrollY > 0){
      document.querySelector('.header').classList.add('active');
  }else{
      document.querySelector('.header').classList.remove('active');
  }
}

// for home pages 

var swiper = new Swiper(".home-slider", {
    spaceBetween: 20,
    effect: "fade",
    grabCursor: true,
    loop:true,
    centeredSlides: true,
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
    },
  });

  //for blog section
  var swiper = new Swiper(".blogs-slider", {
    spaceBetween: 20,
    loop:true,
    grabCursor: true,
    centeredSlides: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
    breakpoints: {
      0: {
        slidesPerView: 1,
      },
      768: {
        slidesPerView: 2,
      },
      991: {
        slidesPerView: 3,
      },
    },
  });

  // Register Doctor
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const user_name = document.getElementById('name').value;
        //const hospital_name = document.getElementById('hospital_name').value;
        const registration_number = document.getElementById('registration_number').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_name, registration_number, email, password }),
        });

        const result = await response.json();
        alert(result.message || result.error);
        if (response.ok) window.location.href = '/login.html';
    });
}

// Login Doctor
if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const registration_number = document.getElementById('registration_number').value;
        const password = document.getElementById('password').value;

        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, registration_number, password }),
        });

        const result = await response.json();
        if (response.ok) {
            localStorage.setItem('token', result.token);
            window.location.href = '/index.html';
        } else {
            alert(result.error);
        }
    });
}
