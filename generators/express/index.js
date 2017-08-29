'use strict';
const Util = require('./../util');
let yeoman = require('yeoman-generator');
let fs = require('fs');
let shell = require('shelljs');

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
let businessNetworkConnection;
const FileWriter = require('composer-common').FileWriter;
const TypescriptVisitor = require('composer-common').TypescriptVisitor;

const BrowserFS = require('browserfs/dist/node/index');
const bfs_fs = BrowserFS.BFSRequire('fs');

let businessNetworkDefinition;
let businessNetworkIdentifier;
let modelManager;
let queryManager;
let assetList = [];
let assetServiceNames = [];
let assetComponentNames = [];
let transactionList = [];
let queryList = [];
let namespaceList;
let introspector;
let assetProperties;
let destinationPath;
let liveNetwork;
let skipInstall = false;
let appName;
let appDescription;
let authorName;
let authorEmail;
let license;
let networkIdentifier;
let connectionProfileName;
let enrollmentId;
let enrollmentSecret;
let apiServer;
let apiIP;
let apiPort;
let apiNamespace;
let fileName;

module.exports = yeoman.Base.extend({
    constructor: function () {
        yeoman.Base.apply(this, arguments);
        this.options = this.env.options;
        if (arguments[1].skipInstall !== undefined) {
            skipInstall = arguments[1].skipInstall;
        }
        if (arguments[1].embeddedRuntime !== undefined) {
            businessNetworkConnection = new BusinessNetworkConnection({
                fs: bfs_fs
            });
        } else {
            businessNetworkConnection = new BusinessNetworkConnection();
        }
    },

    prompting: function () {
        console.log('Welcome to the Hyperledger Composer Express project generator');

        return this.prompt([{
            type: 'confirm',
            name: 'liveNetwork',
            message: 'Do you want to connect to a running Business Network?',
            default: false,
            store: true
        }])
            .then((answers) => {
                liveNetwork = answers.liveNetwork;
                let questions;

                if (liveNetwork) {
                    questions = [{
                        when: !this.options.appName,
                        type: 'input',
                        name: 'appName',
                        message: 'Project name:',
                        default: 'express-app',
                        store: true,
                        validate: Util.validateAppName
                    },
                    {
                        type: 'input',
                        name: 'appDescription',
                        message: 'Description:',
                        default: 'Hyperledger Composer Express project',
                        store: true,
                        validate: Util.validateDescription
                    },
                    {
                        type: 'input',
                        name: 'authorName',
                        message: 'Author name:',
                        store: true,
                        validate: Util.validateAuthorName
                    },
                    {
                        type: 'input',
                        name: 'authorEmail',
                        message: 'Author email:',
                        store: true,
                        validate: Util.validateAuthorEmail
                    },
                    {
                        type: 'input',
                        name: 'license',
                        message: 'License:',
                        default: 'Apache-2.0',
                        store: true,
                        validate: Util.validateLicense
                    },
                    {
                        type: 'input',
                        name: 'networkIdentifier',
                        message: 'Business network identifier:',
                        default: 'digitalproperty-network',
                        store: true,
                        when: function (answers) {
                            return !answers.isNpmSameAsNetworkIdentifier;
                        },
                        validate: Util.validateBusinessNetworkName
                    },
                    {
                        type: 'input',
                        name: 'connectionProfileName',
                        message: 'Connection profile:',
                        default: 'defaultProfile',
                        store: true,
                        validate: Util.validateConnectionProfileName
                    },
                    {
                        type: 'input',
                        name: 'enrollmentId',
                        message: 'Enrollment ID:',
                        store: true,
                        default: 'admin',
                        validate: Util.validateEnrollmentId
                    },
                    {
                        type: 'input',
                        name: 'enrollmentSecret',
                        message: 'Enrollment secret:',
                        store: true,
                        default: 'adminpw',
                        validate: Util.validateEnrollmentSecret
                    },
                    {
                        type: 'list',
                        name: 'apiServer',
                        message: 'Do you want to generate a new REST API or connect to an existing REST API? ',
                        default: 'generate',
                        store: true,
                        choices: [{
                            name: 'Generate a new REST API',
                            value: 'generate'
                        },
                        {
                            name: 'Connect to an existing REST API',
                            value: 'connect'
                        }
                        ],
                        validate: function (input) {
                            if (input !== null && input !== undefined && input !== '') {
                                return true;
                            } else {
                                return 'Connection Profile cannot be null or empty.';
                            }
                        }
                    }
                    ];
                } else {
                    questions = [{
                        when: !this.options.appName,
                        type: 'input',
                        name: 'appName',
                        message: 'Project name:',
                        default: 'express-app',
                        store: true,
                        validate: Util.validateAppName
                    },
                    {
                        type: 'input',
                        name: 'appDescription',
                        message: 'Description:',
                        default: 'Hyperledger Composer Express project',
                        store: true,
                        validate: Util.validateDescription
                    },
                    {
                        type: 'input',
                        name: 'authorName',
                        message: 'Author name:',
                        store: true,
                        validate: Util.validateAuthorName
                    },
                    {
                        type: 'input',
                        name: 'authorEmail',
                        message: 'Author email:',
                        store: true,

                        validate: Util.validateAuthorEmail
                    },
                    {
                        type: 'input',
                        name: 'license',
                        message: 'License:',
                        default: 'Apache-2.0',
                        store: true,
                        validate: Util.validateLicense
                    },
                    {
                        type: 'input',
                        name: 'fileName',
                        message: 'Business network archive file (Path from the current working directory):',
                        default: 'digitalproperty-network.bna',
                        store: true,
                        validate: Util.validateBnaName
                    }
                    ];
                }

                let self = this;
                return this.prompt(questions).then(function (answers) {

                    appName = answers.appName;
                    appDescription = answers.appDescription;
                    authorName = answers.authorName;
                    authorEmail = answers.authorEmail;
                    license = answers.license;

                    let nextQuestions;

                    if (liveNetwork) {
                        networkIdentifier = answers.networkIdentifier;
                        connectionProfileName = answers.connectionProfileName;
                        enrollmentId = answers.enrollmentId;
                        enrollmentSecret = answers.enrollmentSecret;
                        apiServer = answers.apiServer;

                        if (apiServer === 'generate') {

                            apiIP = 'http://localhost';

                            nextQuestions = [{
                                type: 'input',
                                name: 'apiPort',
                                store: true,
                                message: 'REST server port:',
                                default: '3000'
                            },
                            {
                                type: 'list',
                                name: 'apiNamespace',
                                message: 'Should namespaces be used in the generated REST API?',
                                default: 'never',
                                store: true,
                                choices: [{
                                    name: 'Always use namespaces',
                                    value: 'always'
                                },
                                {
                                    name: 'Never use namespaces',
                                    value: 'never'
                                }
                                ],
                                validate: Util.validateNamespace
                            }
                            ];
                        } else if (apiServer === 'connect') {
                            nextQuestions = [{
                                type: 'input',
                                name: 'apiIP',
                                store: true,
                                message: 'REST server address:',
                                default: 'http://localhost'
                            },
                            {
                                type: 'input',
                                name: 'apiPort',
                                store: true,
                                message: 'REST server port:',
                                default: '3000'
                            },
                            {
                                type: 'list',
                                name: 'apiNamespace',
                                message: 'Should namespaces be used in the generated REST API?',
                                default: 'never',
                                store: true,
                                choices: [{
                                    name: 'Namespaces are used',
                                    value: 'always'
                                },
                                {
                                    name: 'Namespaces are not used',
                                    value: 'never'
                                }
                                ],
                                validate: Util.validateNamespace
                            }
                            ];
                        } else {
                            console.log('Unknown option');
                        }

                        return self.prompt(nextQuestions).then(function (answers) {
                            if (apiIP === undefined) {
                                apiIP = answers.apiIP;
                            }
                            apiPort = answers.apiPort;
                            apiNamespace = answers.apiNamespace;
                        });
                    } else {
                        fileName = answers.fileName;

                        nextQuestions = [{
                            type: 'input',
                            name: 'apiIP',
                            store: true,
                            message: 'REST server address:',
                            default: 'http://localhost'
                        },
                        {
                            type: 'input',
                            name: 'apiPort',
                            store: true,
                            message: 'REST server port:',
                            default: '3000'
                        },
                        {
                            type: 'list',
                            name: 'apiNamespace',
                            message: 'Are namespaces used in the generated REST API: ',
                            default: 'never',
                            store: true,
                            choices: [{
                                name: 'Namespaces are used',
                                value: 'always'
                            },
                            {
                                name: 'Namespaces are not used',
                                value: 'never'
                            }
                            ],
                            validate: Util.validateNamespace
                        }
                        ];

                        return self.prompt(nextQuestions).then(function (answers) {
                            if (apiIP === undefined) {
                                apiIP = answers.apiIP;
                            }
                            apiPort = answers.apiPort;
                            apiNamespace = answers.apiNamespace;
                        });
                    }
                });
            });
    },

    writing: function () {
        let completedApp = new Promise((resolve, reject) => {

            if (liveNetwork) {
                return businessNetworkConnection.connect(connectionProfileName, networkIdentifier, enrollmentId, enrollmentSecret)
                    .then((result) => {
                        businessNetworkDefinition = result;
                        return businessNetworkConnection.disconnect();
                    })
                    .then(() => {
                        this.destinationRoot(appName);
                        destinationPath = this.destinationPath();
                        resolve(this._createApp());
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else {
                fs.readFile(fileName, (err, buffer) => {
                    return BusinessNetworkDefinition.fromArchive(buffer)
                        .then((result) => {
                            businessNetworkDefinition = result;
                            this.destinationRoot(appName);
                            destinationPath = this.destinationPath();
                            resolve(this._createApp());
                        })
                        .catch((err) => {
                            reject(err);
                        });
                });
            }
        });
        return completedApp.then(() => {
            console.log('Completed generation process');
        });

    },

    _createApp: function () {
        /* This function will actually generate application code. */

        let createdApp = new Promise((resolve, reject) => {

            businessNetworkIdentifier = businessNetworkDefinition.getIdentifier();
            introspector = businessNetworkDefinition.getIntrospector();

            modelManager = introspector.getModelManager();
            namespaceList = modelManager.getNamespaces();

            queryManager = businessNetworkDefinition.getQueryManager();

            // there should only be one namespace if they're used at all
            namespaceList.forEach((namespace) => {

              if (!(namespace === "org.hyperledger.composer.system")) {

                let modelFile = modelManager.getModelFile(namespace);
                let assetDeclarations = modelFile.getAssetDeclarations();

                // participants should be handled separately, but for now, treat them as assets
                let participantDeclarations = modelFile.getParticipantDeclarations();
                for (var i = 0; i < participantDeclarations.length; i++) {
                  assetDeclarations.push(participantDeclarations[i]);
                }


                assetDeclarations.forEach((asset) => {

                    if (!asset.isAbstract()) {

                        let tempList = [];
                        assetProperties = asset.getProperties();

                        assetProperties.forEach((property) => {
                            if (property.constructor.name === 'Field') {
                                if (property.isTypeEnum() || property.isPrimitive() || !property.isPrimitive()) {
                                    tempList.push({
                                        'name': property.getName(),
                                        'type': property.getType(),
                                        'relation': false
                                    });
                                } else {
                                    console.log('Unknown property type: ' + property);
                                }
                            } else if (property.constructor.name === 'RelationshipDeclaration') {
                                tempList.push({
                                    'name': property.getName(),
                                    'type': property.getType(),
                                    'relation': true
                                });
                            } else {
                                console.log('Unknown property constructor name: ' + property );
                            }
                        });

                        assetList.push({
                            'name': asset.name,
                            'namespace': asset.getModelFile().getNamespace(),
                            'properties': tempList,
                            'identifier': asset.getIdentifierFieldName()
                        });

                    }
                });

                let transactionDeclarations = modelFile.getTransactionDeclarations();
                transactionDeclarations.forEach((transaction) => {

                  if (!transaction.isAbstract()) {

                    let tempList = [];
                    let transactionProperties = transaction.getOwnProperties();

                    for (var i = 0; i < transactionProperties.length; i++) {
                        if (transactionProperties[i].constructor.name === 'Field') {
                            if (transactionProperties[i].isTypeEnum() || transactionProperties[i].isPrimitive() || !transactionProperties[i].isPrimitive()) {
                                tempList.push({
                                    'name': transactionProperties[i].getName(),
                                    'type': transactionProperties[i].getType(),
                                    'relation': false
                                });
                            } else {
                                console.log('Unknown property type: ' + transactionProperties[i]);
                            }
                        } else if (transactionProperties[i].constructor.name === 'RelationshipDeclaration') {
                            tempList.push({
                                'name': transactionProperties[i].getName(),
                                'type': transactionProperties[i].getType(),
                                'relation': true
                            });
                        } else {
                            console.log('Unknown property constructor name: ' + transactionProperties[i] );
                        }
                    }

                    transactionList.push({
                        'name': transaction.name,
                        'namespace': transaction.getModelFile().getNamespace(),
                        'properties': tempList,
                        'identifier': transaction.getIdentifierFieldName()
                    });

                  }

                })

                let queries = queryManager.getQueries();
                queries.forEach((query) => {
                  queryList.push(query);
                })
                // for (var i = 0; i < queries.length; i++) {
                //   console.log('Query name: ' + queries[i].getName());
                //   console.log('Description: ' + queries[i].getDescription());
                //   console.log('Select: ' + queries[i].getSelect().getText());
                // }

              } // if not the system namespace

            }); // end of namespace loop

            console.log("Assets");
            console.log("------");
            console.log(JSON.stringify(assetList));

            let model = this._generateTemplateModel();

            // set up our directories
            shell.mkdir('-p', destinationPath + '/models/');
            shell.mkdir('-p', destinationPath + '/routes/');
            shell.mkdir('-p', destinationPath + '/views/');
            shell.mkdir('-p', destinationPath + '/public/images');
            shell.mkdir('-p', destinationPath + '/public/js');

            // copy the files from the template
            this.fs.copyTpl(this.templatePath('bin/www'), this.destinationPath('bin/www'), model);
            this.fs.copyTpl(this.templatePath('routes/index.js'), this.destinationPath('routes/index.js'), model);
            this.fs.copyTpl(this.templatePath('models/_QueryModel.js'), this.destinationPath('models/_QueryModel.js'), model);
            this.fs.copyTpl(this.templatePath('models/UserTransactionModel.js'), this.destinationPath('models/UserTransactionModel.js'), model);
            this.fs.copyTpl(this.templatePath('routes/UserTransaction.js'), this.destinationPath('routes/UserTransaction.js'), model);
            this.fs.copy(this.templatePath('models/TransactionModel.js'), this.destinationPath('models/TransactionModel.js'));
            this.fs.copy(this.templatePath('routes/Transaction.js'), this.destinationPath('routes/Transaction.js'));
            this.fs.copy(this.templatePath('views/Transaction-list.jade'), this.destinationPath('views/Transaction-list.jade'));
            this.fs.copy(this.templatePath('views/Transaction-detail.jade'), this.destinationPath('views/Transaction-detail.jade'));
            this.fs.copy(this.templatePath('public/css/style.css'), this.destinationPath('public/css/style.css'));
            this.fs.copy(this.templatePath('views/error.jade'), this.destinationPath('views/error.jade'));
            this.fs.copyTpl(this.templatePath('views/index.jade'), this.destinationPath('views/index.jade'), model);
            this.fs.copy(this.templatePath('views/layout.jade'), this.destinationPath('views/layout.jade'));
            this.fs.copy(this.templatePath('_dot_cfignore'), this.destinationPath('.cfignore'));
            this.fs.copy(this.templatePath('_dot_gitignore'), this.destinationPath('.gitignore'));
            this.fs.copyTpl(this.templatePath('app.js'), this.destinationPath('app.js'), model);
            this.fs.copyTpl(this.templatePath('manifest.yml'), this.destinationPath('manifest.yml'), model);
            this.fs.copyTpl(this.templatePath('package.json'), this.destinationPath('package.json'), model);
            this.fs.copyTpl(this.templatePath('README.md'), this.destinationPath('README.md'), model);

            // create the files for each asset
            for (let x = 0; x < assetList.length; x++) {
                this.fs.copyTpl(
                    this.templatePath('asset/model.js'),
                    this.destinationPath('models/' + assetList[x].name + 'Model.js'), {
                        currentAsset: assetList[x],
                        namespace: assetList[x].namespace,
                        assetIdentifier: assetList[x].identifier
                    }
                );
                this.fs.copyTpl(
                    this.templatePath('asset/route.js'),
                    this.destinationPath('routes/' + assetList[x].name + '.js'), {
                        currentAsset: assetList[x],
                        assetIdentifier: assetList[x].identifier
                    }
                );
                this.fs.copyTpl(
                    this.templatePath('asset/view-list.jade'),
                    this.destinationPath('views/' + assetList[x].name + '-list.jade'), {
                        currentAsset: assetList[x],
                        assetIdentifier: assetList[x].identifier
                    }
                );
                this.fs.copyTpl(
                    this.templatePath('asset/view-detail.jade'),
                    this.destinationPath('views/' + assetList[x].name + '-detail.jade'), {
                        currentAsset: assetList[x],
                        assetIdentifier: assetList[x].identifier
                    }
                );
                this.fs.copyTpl(
                    this.templatePath('asset/view-new.jade'),
                    this.destinationPath('views/' + assetList[x].name + '-new.jade'), {
                        currentAsset: assetList[x],
                        assetIdentifier: assetList[x].identifier
                    }
                );
                this.fs.copyTpl(
                    this.templatePath('asset/view-update.jade'),
                    this.destinationPath('views/' + assetList[x].name + '-update.jade'), {
                        currentAsset: assetList[x],
                        assetIdentifier: assetList[x].identifier
                    }
                );
                this.fs.copyTpl(
                    this.templatePath('asset/view-delete.jade'),
                    this.destinationPath('views/' + assetList[x].name + '-delete.jade'), {
                        currentAsset: assetList[x],
                        assetIdentifier: assetList[x].identifier
                    }
                );
            }

            // create the files for each transaction
            for (let x = 0; x < transactionList.length; x++) {
              this.fs.copyTpl(
                  this.templatePath('asset/view-usertransaction.jade'),
                  this.destinationPath('views/' + transactionList[x].name + '.jade'), {
                      currentTransaction: transactionList[x]
                  }
              );

            }


            // // let visitor = new TypescriptVisitor();
            // // let parameters = {
            // //     fileWriter: new FileWriter(this.destinationPath() + '/src/app')
            // // };
            //
            // modelManager.accept(visitor, parameters);
            //
            // assetList = [];
            // assetComponentNames = [];
            // assetServiceNames = [];

            resolve();
        });
        return createdApp.then(() => {
            console.log('Created application!');
        });
    },

    install: function () {
        if (!skipInstall) {
            return this.installDependencies({
                bower: false,
                npm: true
            });
        } else {
            console.log('Skipped installing dependencies');
        }
    },

    _generateTemplateModel: function () {
        return {
            appName: appName,
            appDescription: appDescription,
            authorName: authorName,
            authorEmail: authorEmail,
            license: license,
            businessNetworkIdentifier: businessNetworkIdentifier,
            assetList: assetList,
            transactionList: transactionList,
            queryList: queryList,
            networkIdentifier: networkIdentifier,
            connectionProfileName: connectionProfileName,
            enrollmentId: enrollmentId,
            enrollmentSecret: enrollmentSecret,
            apiServer: apiServer,
            apiIP: apiIP,
            apiPort: apiPort,
            apiNamespace: apiNamespace
        };
    },

    end: function () {
        shell.exec('pkill yo');
    }
});
