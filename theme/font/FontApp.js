const setFont = (fs = 16, fw = 'normal', cl = '#000', lh = fs + 3, type = 'text') => {
    if (type == 'text') {
        return {
            fontSize: fs,
            fontWeight: fw,
            color: cl,
            lineHeight: lh,
            textAlignVertical: 'top'
        }
    } else {
        return {
            fontSize: fs,
            fontWeight: fw,
            color: cl,
            flex: 1,
            textAlignVertical: 'center'
        }
    }

};

export { setFont };