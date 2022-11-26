require('dotenv').config();

import { createApi, Orientation } from 'unsplash-js';
import * as nodeFetch from 'node-fetch';
import axios from 'axios';
import * as fs from 'fs-extra';

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
const param = {
  query: 'profile picture female',
  count: 20,
  orientation: 'squarish' as Orientation,
};

async function main() {
  try {
    const photos = await getPhotos();
    photos.map(downloadPhoto);
  } catch (err) {
    console.log(err);
  }
}
main();

async function getPhotos() {
  if (!ACCESS_KEY) {
    throw new Error('unsplash access key is required');
  }
  const unsplash = createApi({
    accessKey: ACCESS_KEY,
    fetch: nodeFetch.default as unknown as typeof fetch,
  });
  const { response: photos } = await unsplash.photos.getRandom(param);

  if (!photos) return [];
  return Array.isArray(photos) ? photos : [photos];
}

async function downloadPhoto(photo: any) {
  const dir = './output';
  fs.ensureDirSync(dir);
  fs.emptyDirSync(dir);

  const filepath = `${dir}/${photo.id}.jpg`;
  const url = photo.urls.regular;

  const { data } = await axios.get(url, { responseType: 'stream' });
  return new Promise((resolve, reject) => {
    data
      .pipe(fs.createWriteStream(filepath))
      .on('error', reject)
      .once('close', () => resolve(filepath));
  });
}
