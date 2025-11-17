DataTransferItemList.prototype.add = function(data, type) {
    const item = new DataTransferItem();
    item.kind = 'string';
    item.type = type || 'text/plain';
    item.getAsString = function(callback) {
        callback(data);
    };
    this.items.push(item);
}                       