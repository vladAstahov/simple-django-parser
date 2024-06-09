let parseRule = "all"
const csrfField = document.getElementById('token_field')
const urlField = document.getElementById('url_field')
const textButton = document.getElementById('text_button')
const classButton = document.getElementById('class_button')
const allButton = document.getElementById('all_button')
const textField = document.getElementById('text_field')
const classField = document.getElementById('class_field')
const tagField = document.getElementById('tag_field')
const errorText = document.getElementById('error_text')

function initilize() {
    document.getElementById('mainForm').addEventListener('submit', submitForm)
    allButton.addEventListener('click', () => selectRule('all'))
    classButton.addEventListener('click', () => selectRule('class'))
    textButton.addEventListener('click', () => selectRule('text'))

    const fields = [urlField, classField, tagField, textField]

    fields.forEach(element => {
        element?.addEventListener('input', () => {
            element?.classList.remove('is-error')
            errorText.classList.add('is-hidden')
        })  
    })
}

function fetchFx() {
    fetch('/form/parse', {
        method: 'POST',
        headers: {
            'X-CSRFToken': document.getElementById('token_field')?.value
        },
        body: JSON.stringify({
            url: urlField?.value,
            parseRule,
            textRule: textField?.value,
            classRule: classField?.value,
            tagRule: tagField?.value,
        })
        })
            .then(response => {
                if (response.ok) {
                    response.blob().then(blob => {
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.style.display = 'none';
                        a.href = url;
                        a.download = `result_${parseRule}_${new Date().getTime()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        setTimeout(() => {
                            window.URL.revokeObjectURL(url);
                            a.remove();
                        }, 0);
                    })
                } else {
                    response.json().then(({ error }) => {
                        errorText.innerText = error
                        errorText.classList.remove('is-hidden')
                    })
                }
            })
            .catch(error => console.error('Ошибка:', error));
}

function validateFx() {
    return [urlField, classField, tagField, textField].reduce((prev, curr) => {
        if (!curr?.value.length) {
            curr?.classList?.add('is-error')
        }

        return prev && (!!curr?.value.length || curr?.classList.contains('is-hidden'))
    }, true)
}

function submitForm(e) {
    e.preventDefault()
    const isValid = validateFx()
    console.log(isValid)
    if (isValid) {
        fetchFx()
    }
}

function selectRule(v) {
    const fields = [urlField, classField, tagField, textField]

    fields.forEach(element => {
        element?.classList.remove('is-error')
    })

    parseRule = v
    if (v === 'all') {
        textField.classList.add('is-hidden')
        classField.classList.add('is-hidden')    
        tagField.classList.add('is-hidden')
        allButton.classList.add('is-active')
        classButton.classList.remove('is-active')
        textButton.classList.remove('is-active')
    } else if (v === 'class') {
        textField.classList.add('is-hidden')
        classField.classList.remove('is-hidden')    
        tagField.classList.remove('is-hidden') 
        allButton.classList.remove('is-active')
        classButton.classList.add('is-active')
        textButton.classList.remove('is-active')   
    } else {
        textField.classList.remove('is-hidden')
        classField.classList.add('is-hidden')    
        tagField.classList.add('is-hidden')  
        allButton.classList.remove('is-active')
        classButton.classList.remove('is-active')
        textButton.classList.add('is-active')     
    }
}

window.onload = () => {
    initilize()
}