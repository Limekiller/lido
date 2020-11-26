import fs from 'fs-extra'
import path from 'path'

export default (req, res) => {
    if (req.method == 'DELETE') {

    fs.removeSync(
      path.join(
        process.cwd(), '/media/' + req.body.path
      ),
    )
    res.statusCode = 200;
    res.end();

    } else {
        res.statusCode = 403
        res.end()
    }
}
