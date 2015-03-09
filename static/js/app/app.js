define([
    'jquery',
    'app/plugin'
], function ($) {


    $(document).ready(function(){
        var PL = $('img').getIncr({
            debug:true,
            wrap:{
                width:250,
                height:200
            }
        });

        console.log('READY PL ', PL);
        PL.getEl();
    });

});