import * as util from 'util';
import { default as express } from 'express';
export const router = express.Router();
import { approotdir } from '../approotdir.mjs';
const __dirname = approotdir;
import * as path from'path';

import { default as sharp } from 'sharp';

// ホームページ
router.get('/', (req, res, next) => {
  try {
    // 付加パラメータがあるかどうか
    console.log('resizeURL=' + req.query.resizeURL);
    res.render('index', {image_url: req.query.resizeURL ? req.query.resizeURL : undefined});
  } catch (err) {error(err); next(err);}
});


// ファイルアップロードフォーム
router.get('/upload', (req, res, next) => {
  try {
    // 全メモリストを取得して表示
    res.render('upload');
  } catch (err) {error(err); next(err);}
});

// ファイルアップロードを受け付ける
router.post('/upload', async (req, res, next) => {
  try {

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded');
    }

    let uploadFile = req.files.uploadFile;

    // アップロードファイルは20MB以内
    if (uploadFile.size > 20*1024*1024) {
      return res.status(400).send('File size is too big');
    }

    // 対応しているのはpng, jpg, gif, jpegのファイルとする
    let uploadFileExt = path.extname(uploadFile.name);

    if(uploadFileExt !== '.png' && uploadFileExt !== '.jpg' && uploadFileExt !== '.gif' && uploadFileExt !== '.jpeg') {
      return res.status(400).send('Only png, jpg, gif and jpeg are available');
    }

    // 保存するファイル名は同じファイル名が生じるケースを考えてDate.now()をつけたす
    let saveFilename = `${path.basename(uploadFile.name, uploadFileExt)}-${Date.now()}${uploadFileExt}`;

    // サーバー上の保存位置
    let uploadPath = path.join(__dirname, `public/img/upload_icon/${saveFilename}`);

    console.log(`ファイル名: ${uploadFile.name}`);
    console.log(`保存パス: ${uploadPath}`);

    // メモリ上にあるファイルをサーバーパスへ移動させる
    uploadFile.mv(uploadPath, (err) => {

      if(err)
        return res.status(500).send(err);

      // sharpをt使ってリサイズする時のファイル名
      let resizeURL = `img/upload_icon/${path.basename(saveFilename, path.extname(saveFilename))}-resize.jpg`;

      sharp(uploadPath)
      .resize(200, 200, {
        fit: 'inside'})
      .toFile(path.join(__dirname, `public/${resizeURL}`), (err, info)=>{
        if(err){ throw err }
        console.log(info);
      });

      res.redirect(`/?resizeURL=${resizeURL}`);
    });
  } catch (err) {console.log(err); next(err);}
});
