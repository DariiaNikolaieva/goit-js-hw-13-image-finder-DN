import imageCardTpl from './templates/imageCard.hbs';

import getRefs from './js/get-refs';
import PicsApiService from './js/apiService';

import * as basicLightbox from 'basiclightbox';
import * as PNotify from '@pnotify/core/dist/PNotify';
import * as PNotifyMobile from '@pnotify/mobile/dist/PNotifyMobile';
import '@pnotify/core/dist/BrightTheme.css';
import { defaults } from '@pnotify/core';

PNotify.defaultModules.set(PNotifyMobile, {});
defaults.delay = 2000;

const refs = getRefs();

const picsApiService = new PicsApiService();

refs.searchForm.addEventListener('submit', onSearch);
// refs.loadMoreBtn.addEventListener('click', onLoadMore);

function onSearch(evt) {
  evt.preventDefault();

  picsApiService.query = evt.currentTarget.elements.query.value;

  if (picsApiService.query === '') {
    return PNotify.error({
      text: 'Please enter something to search!',
    });
  }

  // if (picsApiService.status >= 400 && picsApiService.status <= 499) {
  //   return PNotify.error({
  //     text: 'Please check your query!',
  //   });
  // }

  picsApiService.resetPage();
  picsApiService.fetchPictures().then(hits => {
    clearGalleryContainer();
    appendPicturesMarkup(hits);
    PNotify.success({
      text: 'Look what I have found!',
    });
  });
}

// function onLoadMore() {
//   picsApiService.fetchPictures().then(appendPicturesMarkup);

//   // плавный скролл
//   // document.querySelector('.smooth-scroll').scrollIntoView({
//   //   behavior: 'smooth',
//   //   block: 'end',
//   // });
// }

function appendPicturesMarkup(hits) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', imageCardTpl(hits));
}

function clearGalleryContainer() {
  refs.galleryContainer.innerHTML = '';
}

// бесконечная загрузка
const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && picsApiService.query !== '') {
      picsApiService.fetchPictures().then(hits => {
        appendPicturesMarkup(hits);
        picsApiService.incrementPage();
      });
    }
  });
};
const observer = new IntersectionObserver(onEntry, {
  rootMargin: '100px',
});
observer.observe(refs.infiniteScroll);

// большое изображение при клике

refs.galleryContainer.addEventListener('click', onImgClick);

function onImgClick(evt) {
  evt.preventDefault();

  const isGalleryImageEl = evt.target.classList.contains('image');
  if (!isGalleryImageEl) {
    return;
  }
  const largeImageURL = evt.target.alt;

  const instance = basicLightbox.create(`<img src="${largeImageURL}" width="100%">`);
  instance.show();
}

// нотификации
