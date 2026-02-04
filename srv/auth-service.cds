service AuthService {

  action login(
    email    : String,
    password : String
  ) returns {
    id   : String;
    role : String;
    name : String;
  };

}
