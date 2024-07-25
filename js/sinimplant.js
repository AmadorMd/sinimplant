document.addEventListener('DOMContentLoaded', function () {
    new Splide('.splide').mount();
    const patologieList = document.getElementById('patologies-list')
    console.log(patologieList)
    const listItemTemplate = patologieList.querySelector('.patologie-item')
    patologies.forEach(patologie => {
        patologieList.appendChild(addAndClone(listItemTemplate, patologie))
    })
    listItemTemplate.remove()
    const form = document.getElementById('contact-form')
    form.onsubmit = (e) => {
        e.preventDefault()
        const data = compileFormData()
        sendContactForm(data)
    }
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            // Obtén el alto de la barra de navegación
            const navbarHeight = document.querySelector('.navbar').offsetHeight;

            // Encuentra el elemento al que se desea desplazar
            const scrollTarget = document.querySelector(this.getAttribute('href'));

            // Calcula la posición a la que se necesita desplazar
            const topOffset = scrollTarget.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

            // Realiza el desplazamiento suave
            window.scrollTo({
                top: topOffset - 20,
                behavior: 'smooth'
            });
        });
    });

});
const headers = {
    "Content-Type": "application/json",
}
const compileFormData = () => {
    const form = document.getElementById('contact-form')
    const data = {}
    form.querySelectorAll('input').forEach(input => {
        data[input.name] = input.value
    })
    return data
}
const sendContactForm = async (data) => {
    console.log(data)

    const success = document.getElementById('success-alert')
    const error = document.getElementById('error-alert')
    error.classList.add('hidden')
    success.classList.add('hidden')
    const { name, email, phone } = data

    const validationStatus = validateFormData(name, email, phone)
    if (!validationStatus) return
    const response = await sendEmail(data)
    if (!response.status) {
        error.classList.remove('hidden')
        document.getElementById('error-message').textContent = response.message
        toggleSubmitButton(false)
        return
    }
    success.classList.remove('hidden')
    document.getElementById('success-message').textContent = response.message
    toggleSubmitButton(false)
    document.getElementById('contact-form').reset()

}
const sendEmail = async (data, retryCount = 3, retryDelay = 1500) => {
    const url = 'http://retirodeimplantes.com/email/send.php'
    for (let i = 0; i < retryCount; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });
            if (response.ok) {
                const data = await response.json();
                if (data.status) {
                    return data;
                } else {
                    console.error('Error sending email:', data.message);
                    return data
                    throw new Error('Error fetching data: ' + JSON.stringify(data.message));
                }
            } else if (response.status === 429) {
                // Si el código de estado es 429, espera un tiempo antes de reintentar
                console.log(`Request rate limit exceeded, retrying in ${retryDelay}ms...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            } else {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            if (i === retryCount - 1) {
                console.error('There was a problem with the fetch operation:', error);
                return null;  // Devolver null en caso de error repetido
            }
        }
    }
}
const validateFormData = (name, email, phone) => {
    const nameField = document.getElementById('name')
    const nameError = document.getElementById('name-error')
    const phoneField = document.getElementById('phone')
    const phoneError = document.getElementById('phone-error')
    const emailField = document.getElementById('email')
    const emailError = document.getElementById('email-error')
    toggleSubmitButton(true)
    const phoneRegex = /^\d{10,}$/;
    if (!phoneRegex.test(phone) || phone.length < 10) {
        phoneField.classList.add('has-error')
        phoneError.classList.remove('hidden')
        phoneError.classList.add('inline-flex')
        phoneError.querySelector('span').textContent = 'El número de teléfono es inválido'
        toggleSubmitButton(false)
        return false
    } else {
        phoneField.classList.remove('has-error')
        phoneError.classList.add('hidden')
        phoneError.classList.remove('inline-flex')
    }
    if (name.length < 3) {
        nameField.classList.add('has-error')
        nameError.classList.remove('hidden')
        nameError.classList.add('inline-flex')
        nameError.querySelector('span').textContent = 'El nombre debe de tener al menos 3 caracteres'
        toggleSubmitButton(false)
        return false
    } else {
        nameField.classList.remove('has-error')
        nameError.classList.add('hidden')
        nameError.classList.remove('inline-flex')
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(email)) {
        emailField.classList.add('has-error')
        emailError.classList.remove('hidden')
        emailError.classList.add('inline-flex')
        emailError.querySelector('span').textContent = 'El correo electrónico es inválido'
        toggleSubmitButton(false)
        return false
    } else {
        emailField.classList.remove('has-error')
        emailError.classList.add('hidden')
        emailError.classList.remove('inline-flex')
    }
    return true
}
const toggleSubmitButton = (state) => {
    const submitting = document.getElementById('submitting')
    const submitBtn = document.getElementById('submit-btn')
    if (state) {
        submitting.classList.remove('hidden')
        submitting.classList.add('flex')
        submitBtn.classList.add('hidden')
        submitBtn.classList.remove('flex')
    } else {
        submitting.classList.add('hidden')
        submitting.classList.remove('flex')
        submitBtn.classList.remove('hidden')
        submitBtn.classList.add('flex')
    }
}
const addAndClone = (template, data) => {
    const item = template.cloneNode(true)
    item.setAttribute('id', data.id)
    item.querySelector('[data-patology="name"]').textContent = data.name
    const button = item.querySelector('button')
    button.onclick = () => openModal(data)
    return item
}
const openModal = (data) => {
    const modal = document.getElementById('patologie-modal')
    if (modal.classList.contains('flex')) return
    const title = document.getElementById('patologie-title')
    const description = document.getElementById('patologie-description')
    title.textContent = data.name
    description.innerHTML = data.description
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    document.querySelector('html').style.overflow = 'hidden'
}
const closeModal = () => {
    const modal = document.getElementById('patologie-modal')
    if (modal.classList.contains('hidden')) return
    const title = document.getElementById('patologie-title')
    const description = document.getElementById('patologie-description')
    title.innerHTML = ""
    description.textContent = ""
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    document.querySelector('html').style.overflow = 'auto'
}
const openProcedureModal = (data) => {
    const modal = document.getElementById('procedures-modal')
    if (modal.classList.contains('flex')) return
    const title = document.getElementById('procedures-title')
    const description = document.getElementById('procedures-description')
    const img = document.getElementById('procedures-img')
    title.textContent = data.name
    description.innerHTML = data.description
    img.src = data.image
    modal.classList.remove('hidden')
    modal.classList.add('flex')
    document.querySelector('html').style.overflow = 'hidden'
}
const closeProcedureModal = () => {
    const modal = document.getElementById('procedures-modal')
    if (modal.classList.contains('hidden')) return
    const title = document.getElementById('procedures-title')
    const description = document.getElementById('procedures-description')
    title.innerHTML = ""
    description.textContent = ""
    modal.classList.add('hidden')
    modal.classList.remove('flex')
    document.querySelector('html').style.overflow = 'auto'
}

const toggleMenu = () => {
    const menu = document.getElementById('mobile-menu')
    if (menu.classList.contains('show')) {
        menu.classList.remove('show')
        return
    }
    menu.classList.add('show')

}
const patologies = [
    {
        id: 1,
        name: 'Contractura capsular',
        description: `<p>Cuando se coloca el implante se forma a su alrededor tejido cicatricial, que el cuerpo forma como cápsula protectora alrededor de cualquier elemento que le resulte extraño. Por lo general la cápsula de tejido es suave o ligeramente firme, imperceptible y ayuda a mantener el implante en su sitio.
                <br><br>
                Algunas veces dicha en dicha cápsula el tejido se torna duro y denso, lo que puede distorsionar el implante mamario encapsulado y hacer que se desplace hacia arriba, lo que puede causar también dolor crónico.</p><br>
                <p>Otros factores que pueden aumentar el riego de contractura son:</p><br>
                <ul>
                    <li>- Rotura de los implantes de seno.</li>
                    <li>- Acumulación de sangre en donde se extirpó tejido durante la cirugía o “hematoma”.</li>
                    <li>- Infección, al formarse una biopelícula microbiana en un implante.</li>
                    <li>- Predisposición genética a la formación de cicatrices.</li>
                </ul>
                `
    },
    {
        id: 2,
        name: 'Dolor en los senos',
        description: `<p>Si posterior a la cirugía y después en tiempo razonable se siguen teniendo molestas, tirantes, picores o incluso pequeños pinchazos en los senos, puede deberse a complicaciones posteriores como una ruptura, rotación de prótesis o contractura capsular. Ante cualquiera de estos síntomas, hay que acudir con tu médico especialista.</p>`
    },
    {
        id: 3,
        name: 'Ruptura (desgarros o agujeros en la cubierta) de los implantes',
        description: `<p>
                Los implantes se rompen por diversos motivos. Entre más tiempo tenga la paciente con sus implantes, el riesgo de ruptura será mayor. Pueden romperse por algún trauma o accidente o la inserción de una aguja durante la biopsia.<br>
                En implantes de solución salina, si el implante se rompe o la válvula falla, la solución se filtra rápidamente por el organismo en pocos días y el seno se ve desinflado.<br>
                Si el implante es de silicona, el gel se drena lentamente por ser más espeso. El organismo no absorbe el gel de silicona. Algunos signos de ruptura son el cambio de forma y tamaño, dolor creciente, mayor firmeza e inflamación durante varios días, y puede provocar también contractura capsular. En ocasiones hay ausencia de síntomas evidentes, lo que se le conoce como “rotura silenciosa”.<br>
                Se recomienda a las pacientes que tengan implantes de gel de silicona, practicarse una resonancia magnética de mama tres años después de la cirugía y después cada dos años para descartar alguna rotura.</p>
                `
    },
    {
        id: 4,
        name: 'Infección',
        description: `<p>
                Una infección bacteriana puede desarrollarse en el tejido que rodea el implante de manera posterior a la cirugía. Algunos de los signos de infección son: <br><br>
                -Fiebre de 38°C o más. <br>
                -Dolor en el seno.<br>
                - Enrojecimiento e inflamación.<br>
                - Secreción en el lugar donde se hizo la incisión.<br>
                - Hematomas. <br><br>
                Generalmente una infección cede con antibióticos y reposo. Si no desaparece en una semana, se recomienda acudir con tu médico para tomar las medidas pertinentes.
                </p>`
    },
    {
        id: 5,
        name: 'Enfermedades autoinmunes',
        description: `<p>
                Algunas pacientes con implantes también han reportado problemas de salud como enfermedades del tejido conectivo, como son el Lupus y la Artritis reumatoide. <br><br>
                    •	<strong>Lupus</strong><br>
                El lupus es una enfermedad que se presenta cuando el sistema inmunitario del cuerpo ataca tus propios tejidos y órganos (enfermedad autoinmune). La inflamación que causa el lupus puede afectar distintos sistemas y órganos del cuerpo, incluso las articulaciones, la piel, los riñones, las células sanguíneas, el cerebro, el corazón y los pulmones.<br><br>
                    •	<strong>Artritis reumatoide</strong><br>
                La artritis reumatoide es un trastorno inflamatorio crónico que puede afectar más que solo las articulaciones. En algunas personas, la afección puede dañar distintos sistemas corporales, incluida la piel, los ojos, los pulmones, el corazón y los vasos sanguíneos.
                La artritis reumatoide es un trastorno autoinmune que ocurre cuando el sistema inmunitario ataca por error los tejidos del cuerpo.
                </p>`
    },
    {
        id: 6,
        name: 'Problemas de lactancia por implantes de seno',
        description: `<p>
                Aunque la lactancia materna suele ser posible después de un implante de senos, algunas mujeres pueden tener problemas para producir suficiente leche, aunque no existe ninguna evidencia científica que lo vincule, pero sí se ha comprobado que los implantes sufren una mayor incidencia de contractura capsular durante el embarazo/lactancia y, más aún, cuando la cirugía es muy reciente.
                </p>`
    },
    {
        id: 7,
        name: 'Síndrome de Asia',
        description: `<p>
                El Síndrome Autoinmune Inducido por Adyuvantes (ASIA, por sus siglas en inglés) es una reacción inflamatoria extremadamente rara y poco común del cuerpo ante el contacto con una sustancia extraña. Hablando de implantes de senos, el gel de silicona puede generar este tipo de reacción. <br><br>
                No siempre se generará este síndrome por tener implantes de seno, ya que este se da por diferentes motivos, y también no todos los implantes propician este tipo de reacción y tampoco de manera inmediata.<br><br>
                Se piensa que la silicona es un adyuvante que potencia la respuesta inmune del cuerpo a través de la liberación de citosina, produciendo mayor cantidad de células autoinmunes en el cuerpo.
                <br><br>
                Los síntomas son variables, pero los más frecuentes pueden ser:<br><br>
                    •	Dolor, debilidad o inflamación muscular o articular.<br>
                    •	Fatiga crónica o alteraciones del sueño.<br>
                    •	Pérdida de memoria o deterioro cognitivo.<br>
                    •	Fiebre y malestar general.<br>
                    •	Sensación de sequedad en la boca.<br>
                    •	Aparición de otras enfermedades (artritis, esclerosis múltiple o sistémica, artralgia).<br>
                </p>`
    },
    {
        id: 7,
        name: 'Dolores de cuello o espalda',
        description: `<p>
                Al momento de hacer un aumento o implante de senos, dependiendo del tamaño, genera un peso adicional que lleva a la paciente a cambios de postura.<br><br>
                El peso excesivo puede generar dolores, deformidades de columna lumbalgia, encorvamientos, escoliosis y otros patologías asociadas con el peso de los implantes, causando un desequilibro en el cuerpo, haciendo que el eje del peso esté echado hacia adelante, lo que provoca que la musculatura del cuello y espalda se activen más para mantener la postura correcta.<br><br>
                Esto mismo causa entumecimiento, hormigueo, postura pobre, incomodidad para la actividad física o hasta la postura al dormir.
                </p>`
    },
    {
        id: 8,
        name: 'Los implantes de seno no son dispositivos de por vida',
        description: `<p>
                Toda mujer que se someta a un aumento de senos, debe estar consciente que no son dispositivos para toda la vida. Cuanto más tiempo tenga los implantes, mayores serán las posibilidades de que desarrolle complicaciones, algunas de las cuales requerirán más cirugía. <br><br>
                Aunque la ciencia ha avanzado a pasos agigantados y los implantes son diseñados con la tecnología de punta y avalados  por estudios médicos, la vida útil de los implantes de senos varía según la persona y es difícil de predecir. Esto quiere decir que en algún momento se podrá necesitar unas cirugías adicionales, pero nadie puede predecir cuándo.
                </p>`
    }
]
