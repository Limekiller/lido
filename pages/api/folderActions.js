import fs from 'fs-extra'
import path from 'path'

export default (req, res) => {
  if (req.method == 'POST') {

    fs.mkdirSync(
      path.join(
        process.cwd(), '/media/' + req.body.path + '/' + req.body.name
      )
    )
    res.statusCode = 200;
    res.end();

  } else if (req.method == 'DELETE') {

    fs.removeSync(
      path.join(
        process.cwd(), '/media/' + req.body.path + '/' + req.body.name
      ),
    )
    res.statusCode = 200;
    res.end();

  } else {
    res.statusCode = 403
    res.end()
  }
}
