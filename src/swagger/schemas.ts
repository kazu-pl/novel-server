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
 *        - login
 *        - password
 *        - repeatedPassword
 *      properties:
 *        login:
 *          type: string
 *          description: login used to register
 *        password:
 *          type: string
 *          description: password
 *        repeatedPassword:
 *          type: string
 *          description: the same password passed twice
 *      example:
 *        login: myLogin
 *        password: Pa$sWorD
 *        repeatedPassword: Pa$sWorD
 *
 *
 *    RequestLoginCredentials:
 *      type: object
 *      required:
 *        - login
 *        - password
 *      properties:
 *        login:
 *          type: string
 *          description: Login that is used to log in
 *        password:
 *          type: string
 *          description: password
 *      example:
 *        login: myLogin
 *        password: Pa$sWorD
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
 *      properties:
 *        name:
 *          type: string
 *          description: user name
 *        surname:
 *          type: string
 *          description: user surname
 *      example:
 *        name: John
 *        surname: Doe
 */
