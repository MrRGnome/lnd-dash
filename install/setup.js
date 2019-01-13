'use strict';

//set up lightning protocol
require('../install/lightning-uri-scheme');


//setup config file
require('../install/config')().then(() => {
    console.log("Successfully completed lnd-dash setup");
});
