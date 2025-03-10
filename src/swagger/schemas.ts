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
 *        message: request was sucessfully processed
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
 *          type: string
 *          description: create timestamp
 *        updatedAt:
 *          type: string
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
 *    SingleSceneryFromDictionary:
 *      type: object
 *      description: type of single entity of scenery disctionary
 *      required:
 *      - title
 *      - id
 *      properties:
 *        title:
 *          type: string
 *        id:
 *          type: string
 *      example:
 *        title: Mansion
 *        id: 0000-0000-0000-0000
 *
 *
 *    SceneriesDictionary:
 *      type: object
 *      desctiption: get dictionary of all sceneries
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SingleSceneryFromDictionary'
 *      example:
 *        data: []
 *
 *    ImagesCountResponse:
 *      type: object
 *      desctiption: get list of all characters's images, their ids and names
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SingleCharacterFromImagesCount'
 *      example:
 *        data: []
 *
 *    ScenesCountResponse:
 *      type: object
 *      desctiption: get list of all acts's scenes amount
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SingleItemFromActScenesOrDialogCount'
 *      example:
 *        data: []
 *
 *    DialogsCountResponse:
 *      type: object
 *      desctiption: get list of all acts's dialogs amount
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SingleItemFromActScenesOrDialogCount'
 *      example:
 *        data: []
 *
 *    RequestCharacter:
 *      type: object
 *      description: type of request data passed in request when creating new character or update basic character data
 *      required:
 *        - title
 *        - description
 *      properties:
 *        title:
 *          type: string
 *          description: character title
 *        description:
 *          type: string
 *          description: character description
 *      example:
 *        title: Yuuta
 *        description: main character
 *
 *
 *    CharacterImage:
 *      type: object
 *      description: single character image
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
 *          description: url to get character image
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
 *    Character:
 *      type: object
 *      description: single character
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
 *            $ref: '#/components/schemas/CharacterImage'
 *          description: array of character images
 *        __v:
 *          type: number
 *          description: mongodb __v
 *        createdAt:
 *          type: string
 *          description: create timestamp
 *        updatedAt:
 *          type: string
 *          description: update timestamp
 *      example:
 *        _id: 6181395d67568b70180ce93b
 *        title: Yuuta
 *        description: main character
 *        imagesList: []
 *        __v: 0
 *        createdAt: 2021-11-04T11:01:42.143+00:00
 *        updatedAt: 2021-11-04T11:01:42.143+00:00
 *
 *
 *    CharactersResponse:
 *      type: object
 *      description: returns list of characters (if no filters specified, returns first 5 characters)
 *      required:
 *        - data
 *        - totalItems
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Character'
 *          description: list of characters
 *        totalItems:
 *          type: number
 *          description: number of total characters
 *
 *
 *    SingleCharacterFromDictionary:
 *      type: object
 *      description: type of single entity of characters disctionary
 *      required:
 *      - title
 *      - id
 *      properties:
 *        title:
 *          type: string
 *        id:
 *          type: string
 *      example:
 *        title: Yuuta
 *        id: 0000-0000-0000-0000
 *
 *
 *    CharactersDictionary:
 *      type: object
 *      desctiption: get dictionary of all characters
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SingleCharacterFromDictionary'
 *      example:
 *        data: []
 *
 *
 *    SingleCharacterFromImagesCount:
 *      type: object
 *      description: type of single entity of character from images count list
 *      required:
 *      - id
 *      - name
 *      - imagesCount
 *      properties:
 *        id:
 *          type: string
 *        name:
 *          type: string
 *        imagesCount:
 *          type: number
 *      example:
 *        title: Yuuta
 *        id: 0000-0000-0000-0000
 *        imagesCount: 6
 *
 *    SingleItemFromActScenesOrDialogCount:
 *      type: object
 *      description: type of single entity of act scenes count
 *      required:
 *      - id
 *      - name
 *      - count
 *      properties:
 *        id:
 *          type: string
 *        name:
 *          type: string
 *        count:
 *          type: number
 *      example:
 *        title: Yuuta
 *        id: 0000-0000-0000-0000
 *        count: 6
 *
 *    SingleCharacterResponse:
 *      type: object
 *      description: response with character data in `data` key
 *      required:
 *        - data
 *      properties:
 *        data:
 *          type: object
 *          description: scenery
 *          $ref: '#/components/schemas/Character'
 *
 *
 *
 *
 *    CharacterOnScreen:
 *      type: object
 *      description: signle character visible on screen options
 *      required:
 *      - characterId
 *      - leftPosition
 *      - zIndex
 *      - imgUrl
 *      - name
 *      properties:
 *        characterId:
 *          type: string
 *          description: id of the character visible on screen
 *        name:
 *          type: string
 *          description: character name
 *        leftPosition:
 *          type: number
 *          description: X transition on the screen
 *        zIndex:
 *          type: number
 *          description: z-index value
 *        imgUrl:
 *          type: string
 *          description: link to character img
 *      example:
 *        characterId: 0000-0000-0000-0000
 *        leftPosition: 45
 *        name: Aqua
 *        zIndex: 2
 *        imgUrl: /files/character-sad.jpg
 *
 *    CharacterOnScreenExtended:
 *      allOf:
 *        - $ref: '#/components/schemas/CharacterOnScreen'
 *      type: object
 *      required:
 *      - name
 *      - leftPosition
 *      - zIndex
 *      - imgUrl
 *      - _id
 *      properties:
 *        _id:
 *          type: string
 *
 *
 *    Dialog:
 *      type: object
 *      description: Single Dialog type
 *      required:
 *      - text
 *      - charactersOnScreen
 *      properties:
 *        text:
 *          type: string
 *          description: text that some charact is saying
 *        characterSayingText:
 *          type: string
 *          description: character name that says the text
 *        charactersOnScreen:
 *          type: array
 *          description: array of characters visible on screen
 *          items:
 *            $ref: '#/components/schemas/CharacterOnScreen'
 *      example:
 *        text: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras tempus enim ac molestie pharetra. Aliquam pretium pharetra finibus. Etiam rutrum
 *        characterSayingText: Yuuta
 *        charactersOnScreen:
 *          allOf:
 *            $ref: '#/components/schemas/CharacterOnScreen'
 *
 *
 *    DialogExtended:
 *      allOf:
 *        - $ref: '#/components/schemas/Dialog'
 *      type: object
 *      description: Single Dialog type with mongoDB _id field
 *      required:
 *      - text
 *      - charactersOnScreen
 *      - _id
 *      properties:
 *        _id:
 *          type: string
 *        charactersOnScreen:
 *          type: array
 *          description: array of characters visible on screen
 *          items:
 *            $ref: '#/components/schemas/CharacterOnScreenExtended'
 *
 *
 *
 *
 *    Scene:
 *      type: object
 *      description: signle Scene type
 *      required:
 *      - title
 *      - bgImg
 *      - dialogs
 *      properties:
 *        title:
 *          type: string
 *          description: scene title
 *        bgImg:
 *          type: object
 *          description: scene background image
 *          required:
 *          - sceneryId
 *          - link
 *          properties:
 *            sceneryId:
 *              type: string
 *            link:
 *              type: string
 *        dialogs:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Dialog'
 *      example:
 *        title: basic conversation between Yuuta and Shion
 *        bgImg:
 *          link: /files/mansion.jpg
 *          sceneryId: 0000-0000-0000-0000
 *        dialogs:
 *          allOf:
 *            $ref: '#/components/schemas/Dialog'
 *
 *
 *    SceneExtended:
 *      allOf:
 *        - $ref: '#/components/schemas/Scene'
 *      required:
 *      - title
 *      - bgImg
 *      - dialogs
 *      - _id
 *      properties:
 *        _id:
 *          type: string
 *        bgImg:
 *          type: object
 *          description: scene background image
 *          required:
 *          - sceneryId
 *          - link
 *          - _id
 *          properties:
 *            sceneryId:
 *              type: string
 *            link:
 *              type: string
 *            _id:
 *              type: string
 *        dialogs:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/DialogExtended'
 *
 *    Act:
 *      type: object
 *      description: Act type (used as newly adding Act item type and as a basic type extended by additional items from mongoDB in returning Act)
 *      required:
 *      - title
 *      - description
 *      - type
 *      - scenes
 *      properties:
 *        title:
 *          type: string
 *          description: act title. Its unique title (no duplications allowed)
 *        description:
 *          type: string
 *          description: act description
 *        type:
 *          type: string
 *          description: act type
 *          enum: [start, normal, end]
 *        nextAct:
 *          type: string
 *          description: title of the next Act. If its end act, then nextAct is not needed. If its used to get first act to start game, pass 'start'
 *        scenes:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/Scene'
 *      example:
 *        title: Act I - The beginning
 *        desciption: This is the first Act. It introduces all main characters.
 *        type: start
 *        nextAct: Act II - The Dawn
 *        scenes: []
 *
 *    ActExtended:
 *      allOf:
 *        - $ref: '#/components/schemas/Act'
 *      type: object
 *      description: Act type that extends basic Act type. It Adds fields from mongoDB
 *      required:
 *      - title
 *      - description
 *      - type
 *      - scenes
 *      - _id
 *      - __v
 *      - createdAt
 *      - updatedAt
 *      properties:
 *        scenes:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SceneExtended'
 *        _id:
 *          type: string
 *          description: mongodb id
 *        __v:
 *          type: number
 *          description: mongodb __v
 *        createdAt:
 *          type: string
 *          description: create timestamp
 *        updatedAt:
 *          type: string
 *          description: update timestamp
 *      example:
 *        _id: 6181395d67568b70180ce93b
 *        __v: 0
 *        createdAt: 2021-11-04T11:01:42.143+00:00
 *        updatedAt: 2021-11-04T11:01:42.143+00:00
 *
 *
 *    ActExtendedResponse:
 *      type: object
 *      description: resonse with extended act in data member
 *      required:
 *      - data
 *      properties:
 *        data:
 *          type: object
 *          description: extended act
 *          $ref: '#/components/schemas/ActExtended'
 *
 *
 *    RequestUpdateAct:
 *      allOf:
 *        - $ref: '#/components/schemas/Act'
 *      type: object
 *      desciption: type of act you post to update
 *      required:
 *      - _id
 *      properties:
 *        _id:
 *          type: string
 *          description: mongodb id
 *      example:
 *        _id: 6181395d67568b70180ce93b
 *
 *
 *    ActsResponse:
 *      type: object
 *      description: response with all acts to dispaly them in a table
 *      required:
 *      - data
 *      - totalItems
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/ActExtended'
 *          description: an array with all acts
 *        totalItems:
 *          type: number
 *          description: nmber of total acts
 *      example:
 *        data: []
 *        totalItems: 0
 *
 *    RequestDeleteAct:
 *      type: object
 *      description: contains id of act to delete
 *      required:
 *      - id
 *      properties:
 *        id:
 *          type: string
 *          description: act id
 *      example:
 *        id: 0000-0000-0000-0001
 *
 *
 *
 *    SingleActDictionaryObject:
 *      type: object
 *      description: single act id and title
 *      required:
 *      - id
 *      - title
 *      properties:
 *        id:
 *          type: string
 *          description: act id
 *        title:
 *          type: string
 *          description: act title to display to user
 *      example:
 *        id: 0000-0000-0000-0000
 *        title: Act I - The beginning of the Dawn
 *
 *    ActDictionary:
 *      type: object
 *      description: list of objects with id and title of every act
 *      required:
 *      - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/SingleActDictionaryObject'
 *
 *
 *
 *    RequestGameSave:
 *      type: object
 *      description: object of game save
 *      required:
 *      - actId
 *      - actTitle
 *      - sceneIndex
 *      - dialogIndex
 *      - text
 *      properties:
 *        actId:
 *          type: string
 *        actTitle:
 *          type: string
 *        sceneIndex:
 *          type: number
 *        dialogIndex:
 *          type: number
 *        text:
 *          type: string
 *        characterSayingText:
 *          type: string
 *
 *    ExtendedGameSave:
 *      allOf:
 *        - $ref: '#/components/schemas/RequestGameSave'
 *      type: object
 *      required:
 *      - actId
 *      - actTitle
 *      - sceneIndex
 *      - dialogIndex
 *      - text
 *      - _id
 *      properties:
 *        _id:
 *          type: string
 *          description: mongodb id
 *
 *    ExtendedGameSaveResponse:
 *      type: object
 *      required:
 *      - data
 *      properties:
 *        data:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/ExtendedGameSave'
 *
 *
 */
