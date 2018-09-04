var fetch = require("node-fetch");
var crypto = require("crypto");

module.exports = function (context, queueItem) {
    context.log('JavaScript queue trigger function processed work item:', queueItem);

    var subscriptions = context.bindings.webhooksubscription;
    
    console.log({subscription});

    if (subscriptions.length > 0) {
        var subscription = subscriptions[0];

        var body = JSON.stringify({
            eventId: context.bindingData.id,
            createdAt: context.bindingData.insertionTime,
            message: queueItem.message
        });

        var signature = getSignature(body, subscription.secret)
        fetch(subscription.url, {
            method: "POST",
            headers: {
                "X-Hub-Signature": signature,
                "X-Event-Type": queueItem.eventType,
                "Content-Type": "application/json"
            },
            body
        })
        .then(() => context.log("sent to ", subscription.url))
        .catch(error => context.log("could not send it to ", subscription.url, " ", error));
    }

    context.done();
};

getSignature = (payload, key) => {
    var sha1Prefix = "sha1=";
    var encoded  = new Buffer.from(payload, "ascii");
    return sha1Prefix + crypto.createHmac("sha1", key).update(encoded).digest("hex");
}