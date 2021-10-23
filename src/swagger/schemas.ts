export {};

/**
 * @swagger
 * components:
 *  schemas:
 *    Tokens:
 *      type: object
 *      required:
 *        - accessToken
 *        - refreshToken
 *      properties:
 *        accessToken:
 *          type: string
 *          description: token used to authenticate and authorize user.
 *        refreshToken:
 *          type: string
 *          description: token used to regenerate new accessToken if it expired
 *      example:
 *        accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFzZCIsImlhdCI6MTYzNDM3MjQ3NiwiZXhwIjoxNjM0MzcyNTA2fQ.KVLILQs_Brp_WRtOmPGi86l40hOnoxnd32XK5rI33EQ
 *        refreshToken: 5bhk88956redhjjgfhI1NiIsInR5cCI6IkpXVCJ9.B6rfTYJr4GHhdbig56y7h7hg4g4ghy6Hh6MTYzNDM3MjQ3fggfghreeghute3NjM0T.KVLILQs_Brp_WRtOmPGi86l40hOnoxnd32XK5rI33EQ
 *
 *
 *    AccessToken:
 *      type: object
 *      required:
 *        - accessToken
 *      properties:
 *        accessToken:
 *          type: string
 *          description: token used to authenticate and authorize user.
 *      example:
 *        accessToken: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImFzZCIsImlhdCI6MTYzNDM3MjQ3NiwiZXhwIjoxNjM0MzcyNTA2fQ.KVLILQs_Brp_WRtOmPGi86l40hOnoxnd32XK5rI33EQ
 *
 *
 *    RequestRegisterCredentials:
 *      type: object
 *      required:
 *        - password
 *        - repeatedPassword
 *        - email
 *        - name
 *        - surname
 *      properties:
 *        password:
 *          type: string
 *          description: password
 *        repeatedPassword:
 *          type: string
 *          description: the same password passed twice
 *        email:
 *          type: string
 *          description: email
 *        name:
 *          type: string
 *          description: your name
 *        surname:
 *          type: string
 *          description: your surname
 *      example:
 *        password: admin123
 *        repeatedPassword: admin123
 *        email:  admin@asd.pl
 *        name: John
 *        surname: Doe
 *
 *
 *    RequestLoginCredentials:
 *      type: object
 *      required:
 *        - email
 *        - password
 *      properties:
 *        email:
 *          type: string
 *          description: email that is used to log in
 *        password:
 *          type: string
 *          description: password
 *      example:
 *        email: admin@asd.pl
 *        password: admin123
 *
 *
 *    RequestRefreshTokenCredentials:
 *      type: object
 *      required:
 *        - refreshToken
 *      properties:
 *        refreshToken:
 *          type: string
 *          description: refreshToken
 *      example:
 *        refreshToken: 5bhk88956redhjjgfhI1NiIsInR5cCI6IkpXVCJ9.B6rfTYJr4GHhdbig56y7h7hg4g4ghy6Hh6MTYzNDM3MjQ3fggfghreeghute3NjM0T.KVLILQs_Brp_WRtOmPGi86l40hOnoxnd32XK5rI33EQ
 *
 *    UserProfile:
 *      type: object
 *      required:
 *        - name
 *        - surname
 *        - email
 *      properties:
 *        name:
 *          type: string
 *          description: user name
 *        surname:
 *          type: string
 *          description: user surname
 *        email:
 *          type: string
 *          description: email
 *      example:
 *        name: John
 *        surname: Doe
 *        email: admin@asd.pl
 *
 *
 *    RequestUpdateUser:
 *      type: object
 *      required:
 *        - name
 *        - surname
 *        - email
 *      properties:
 *        name:
 *          type: string
 *          description: user name
 *        surname:
 *          type: string
 *          description: user surname
 *        email:
 *          type: string
 *          description: user email
 *      example:
 *        name: John
 *        surname: Doe
 *        email: admin@asd.pl
 *
 *
 *    RequestRemindPasswordCredentials:
 *      type: object
 *      required:
 *        - email
 *      properties:
 *        email:
 *          type: string
 *          description: On the email we will send you your password
 *      example:
 *        email: admin@asd.pl
 *
 *
 *
 *    RequestRenewPassword:
 *      type: object
 *      required:
 *        - password
 *        - repeatedPassword
 *      properties:
 *        password:
 *          type: string
 *          description: new password
 *        repeatedPassword:
 *          type: string
 *          desciption: the same password
 *      example:
 *        password: qwerty123
 *        repeatedPassword: qwerty123
 */
