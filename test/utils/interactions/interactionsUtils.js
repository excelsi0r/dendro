exports.recordInteraction = function (jsonOnly, folderUri, projectHandle, interactionData, agent, cb)
{
    const path = folderUri + '?register_interaction';

    if (jsonOnly)
    {
        agent
            .post(path)
            .send(interactionData)
            .set('Accept', 'application/json')
            .end(function (err, res)
            {
                cb(err, res);
            });
    }
    else
    {
        agent
            .post(path)
            .send(interactionData)
            .end(function (err, res)
            {
                cb(err, res);
            });
    }
};


exports.deletesAllInteractions= function (jsonOnly, folderUri, projectHandle, interactionData, agent, cb) {
    const path = folderUri + "?delete_all";

    if(jsonOnly)
    {
        agent
            .get(path)
            .set('Accept', 'application/json')
            .end(function (err, res) {
                cb(err, res);
            });
    }
    else
    {
        agent
            .get(path)
            .end(function (err, res) {
                cb(err, res);
            });
    }
};