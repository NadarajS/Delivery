const mysql = require("mysql");

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DATABASE,
});



exports.register = (req, res) => {
    console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;


    // const { name, email, password, passwordConfirm } = req.body;

    db.query('SELECT email FROM users1 WHERE email = ?', [email], async(error, results) => {
        if (error) {
            console.log(error);
        }
        if (results.length > 0) {
            return res.render('register', {
                message: 'That email has already in use'
            });
        } else if (password !== passwordConfirm) {
            return res.render('register', {
                message: 'Password do not match'
            });
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        //  console.log(hashedPassword);

        db.query('INSERT INTO users1 SET ?', { name: name, email: email, password: hashedPassword }, (error, results) => {
            if (error) {
                console.log(error);
            } else {
                console.log(results);
                return res.render('register', {
                    message: 'User Resgistered'
                });
            }
        })

    });
    //   res.send("From Submitted");
}

exports.login = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).render('login', {
                message: 'Please provide all details'
            });


        }
        db.query('SELECT * FROM users1 WHERE email = ?', [email], async(error, results) => {
            console.log(results);
            if (!results || !(await bcrypt.compare(password, results[0].password))) {
                return res.status(401).render('login', {
                    message: 'Email or password in incorrect'
                });

            } else {
                const id = results[0].id;

                const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
                    expiresIn: process.env.JWT_EXPIRES_IN
                });
                console.log("The token is:" + token);
                //  alert("Successfully Logged");

                /* const cookieOptions = {
                     expires: new Date(
                         Date.now() + process.env.JWT_COOKIE_DATE * 24 * 60 * 60 * 1000
                     ),
                     httpOnly: true
                 } */
                res.cookie('jwt', token, cookieOptions);
                return res.render('second', {
                    message: 'Welcome'
                });

            }
        })


    } catch (error) {
        console.log(error);
    }
}
