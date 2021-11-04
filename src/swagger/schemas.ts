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
 *        avatar:
 *          type: string
 *          description: relative link to avatar img (empty string if no avatar avaliable)
 *      example:
 *        name: John
 *        surname: Doe
 *        email: admin@asd.pl
 *        avatar: /files/some_avatar.png
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
 *
 *
 *    Avatar:
 *      type: object
 *      required:
 *        - avatarUrl
 *      properties:
 *        avatarUrl:
 *          type: string
 *          description: new avatar string or empty string if no avatar avaliable
 *      example:
 *        avatarUrl: /files/some_avatar.png
 *
 *
 *    SuccessfulReqMsg:
 *      type: object
 *      description: this type is the type of response you can try in then() in components try/catch block
 *      required:
 *        - message
 *      properties:
 *        message:
 *          type: string
 *          description: message you can dispaly on front application
 *      example:
 *        message: resource was created successfuly
 *
 *    FailedReqMsg:
 *      type: object
 *      description: this type is the type of error you can catch in catch() in redux-toolkit createAsyncThunk
 *      required:
 *        - message
 *      properties:
 *        message:
 *          type: string
 *          description: response message
 *        error:
 *          type: any
 *          description: response error
 *      example:
 *        message: An error occured when trying to register new resource
 *        error: error object.
 *
 *
 *    RequestScenery:
 *      type: object
 *      description: type of request data passed in request when creating new scenery or update basic scenery data
 *      required:
 *        - title
 *        - description
 *      properties:
 *        title:
 *          type: string
 *          description: scenery title
 *        description:
 *          type: string
 *          description: scenery description
 *      example:
 *        title: mansion
 *        description: main character mansion
 *
 *
 *    SceneryImage:
 *      type: object
 *      description: single scenery image
 *      required:
 *        - originalName
 *        - url
 *        - filename
 *        - _id
 *      properties:
 *        originalName:
 *          type: string
 *          description: the original name before being sent to server
 *        url:
 *          type: string
 *          description: url to get scenery image
 *        filename:
 *          type: string
 *          description: name of the resource under which you can find it on server
 *        _id:
 *          type: string
 *          description: resource id
 *      example:
 *        originalName: in-flames_owl_boy.png
 *        url: /files/1635858781056-in-flames_owl_boy.png
 *        filename: 1635858781056-in-flames_owl_boy.png
 *        _id: 6181395d67568b70180ce91b
 *
 *    Scenery:
 *      type: object
 *      description: single scenery
 *      required:
 *        - _id
 *        - title
 *        - description
 *        - imagesList
 *        - __v
 *        - createdAt
 *        - updatedAt
 *      properties:
 *        _id:
 *          type: string
 *          description: mongodb id
 *        title:
 *          type: string
 *          description: scenery title
 *        description:
 *          type: string
 *          description: scenery description
 *        imagesList:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SceneryImage'
 *          description: array of scenery images
 *        __v:
 *          type: number
 *          description: mongodb __v
 *        createdAt:
 *          type: date
 *          description: create timestamp
 *        updatedAt:
 *          type: date
 *          description: update timestamp
 *      example:
 *        _id: 6181395d67568b70180ce93b
 *        title: mansion
 *        description: main character mansion
 *        imagesList: []
 *        __v: 0
 *        createdAt: 2021-11-04T11:01:42.143+00:00
 *        updatedAt: 2021-11-04T11:01:42.143+00:00
 *
 *
 *    SingleSceneryResponse:
 *      type: object
 *      description: response with scenery data in `data` key
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: object
 *          description: scenery
 *          $ref: '#/components/schemas/Scenery'
 *
 *    SceneriesResponse:
 *      type: object
 *      description: returns list of sceneries (if no filters specified, returns first 5 sceneries)
 *      required:
 *        - data
 *        - totalItems
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Scenery'
 *          description: list of sceneries
 *        totalItems:
 *          type: number
 *          description: number of total sceneries
 *
 *
 */
