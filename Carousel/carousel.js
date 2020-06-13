const track = document.querySelector('.carousel_track');
const slides = Array.from(track.children);
const nextbutton = document.querySelector('.carousel_button--right');
const prevbutton = document.querySelector('.carousel_button--left');
const nav = document.querySelector('.carousel_nav');
const dots = Array.from(nav.children);

var firstrun=1;
var autoscroll;
var transition = 1;

var slidewidth = slides[0].getBoundingClientRect().width;

const setSlidePosition = (slide, index) => { 
    slide.style.left = slidewidth*index + 'px';
}

function setWidthandpos(){  
    slidewidth = slides[0].getBoundingClientRect().width;
    slides.forEach(setSlidePosition)
}

setWidthandpos();

const movetoslide = (targetindex) => {
    const currentindex = slides.findIndex(slide => slide === track.querySelector('.current-slide'));
    if(!transition) track.style.transition = 'none';
    else track.style.transition = 'transform 350ms ease-in';
    track.style.transform = 'translateX(-' + slides[targetindex].style.left + ')';
    slides[currentindex].classList.remove('current-slide');
    slides[targetindex].classList.add('current-slide'); 
    dots[currentindex].classList.remove('current-slide');
    dots[targetindex].classList.add('current-slide');
    clearTimeout(autoscroll);
    transition = 1;
}

function movenext(){
    const currentindex = slides.findIndex(slide => slide === track.querySelector('.current-slide'));
    const targetindex = (currentindex+1)%3;
    movetoslide(targetindex);
}

nextbutton.addEventListener('click', movenext)

prevbutton.addEventListener('click', e =>{
    const currentindex = slides.findIndex(slide => slide === track.querySelector('.current-slide'));
    const targetindex = (currentindex+2)%3;
    movetoslide(targetindex);
})

nav.addEventListener('click', e =>{
    const targetdot = e.target.closest('button');
    if(!targetdot) return;
    const targetindex = dots.findIndex(dot => dot === targetdot);
    movetoslide(targetindex);
})


function carousel(){
    if(!firstrun) movenext();
    firstrun=0;
    autoscroll = setTimeout(carousel, 4000);
}

var resizeTimeout;

window.addEventListener('resize', e =>{
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(reconfigure, 100);
});

function reconfigure(){
    setWidthandpos();
    const currentindex = slides.findIndex(slide => slide === track.querySelector('.current-slide'));
    transition = 0;
    movetoslide(currentindex);
}

window.onload = carousel;