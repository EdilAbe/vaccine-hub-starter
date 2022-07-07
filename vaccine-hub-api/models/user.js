const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const bcrypt = require("bcrypt");
const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

class User {
  static async makePublicUser(user) {
    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      location: user.location,
      date: user.date,
    };
  }

  static async login(credentials) {
    // if the user dont fill out the inputs throw an error
    // and look up -> match -> return the user(success)
    // if it goes wrong --> throw unauthorized error

    const requiredFields = ["email", "password"];
    requiredFields.forEach((field) => {
      if (!credentials.hasOwnProperty(field)) {
        throw new BadRequestError(`Missing ${field} in request body`);
      }
    });

    const user = await User.fetchUserByEmail(credentials.email);
    //if they enter the right password
    if (user) {
      const isValid = await bcrypt.compare(credentials.password, user.password);
      if (isValid) {
        return User.makePublicUser(user);
      }
    }
    throw new UnauthorizedError("You entered invalid email or password");
  }

  static async register(credentials) {
    // if any fields are missing throw an error
    // make sure the emails are unique  or else throw an error
    // take the users password and hash it
    // create a new user into a database with all the information

    const requiredFields = [
      "first_name",
      "last_name",
      "location",
      "email",
      "password",
      "date",
    ];

    console.log(credentials);

    requiredFields.forEach((field) => {
      if (!credentials.hasOwnProperty(field) || credentials[field] == "") {
        console.log("missing input");
        throw new BadRequestError(`Missing ${field}`);
      }
    });
    //check for correct email input
    if (credentials.email.indexOf("@") < 0) {
      throw new BadRequestError(`Duplicate email: ${credentials.email}`);
    }

    //check each user is using a unique email address
    const existingUser = await User.fetchUserByEmail(credentials.email);
    if (existingUser) {
      throw new BadRequestError("email account has been registered");
    }

    // hash users password
    const hashedPassword = await bcrypt.hash(
      credentials.password,
      BCRYPT_WORK_FACTOR
    );
    const lowercasedEmail = credentials.email.toLowerCase();

    //adding a new user
    const result = await db.query(
      `
    INSERT INTO users ( email, first_name, last_name, password, location, date) 
    VALUES ($1,$2,$3, $4, $5, $6)
    RETURNING id,  email, first_name, last_name, password, location, date`,
      [
        lowercasedEmail,
        credentials.first_name,
        credentials.last_name,
        hashedPassword,
        credentials.location,
        credentials.date,
      ]
    );

    //return the user
    const user = result.rows[0];
    return User.makePublicUser(user);
  }
  static async fetchUserByEmail(email) {
    try {
      if (!email) {
        throw new BadRequestError("No email provided");
      }

      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await db.query(query, [email.toLowerCase()]);
      const user = result.rows[0];
      return user;
    } catch (err) {
      console.log("hello", err);
    }
  }
}

module.exports = User;
