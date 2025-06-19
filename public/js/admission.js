document.addEventListener('DOMContentLoaded', function() {
    const admissionForm = document.getElementById('admissionForm');
    const appliedClassSelect = document.getElementById('appliedClass');

    // Add client-side validation
    function validateForm() {
        let isValid = true;
        const errors = {};

        // Required fields
        const requiredFields = [
            'studentName',
            'dateOfBirth',
            'gender',
            'appliedClass',
            'fatherName',
            'motherName',
            'email',
            'contactNumber',
            'address'
        ];

        requiredFields.forEach(field => {
            const input = admissionForm.querySelector(`[name="${field}"]`);
            if (!input.value.trim()) {
                isValid = false;
                errors[field] = 'This field is required';
                input.classList.add('is-invalid');
            }
        });

        // Email validation
        const emailInput = admissionForm.querySelector('[name="email"]');
        if (emailInput.value && !isValidEmail(emailInput.value)) {
            isValid = false;
            errors.email = 'Please enter a valid email address';
            emailInput.classList.add('is-invalid');
        }

        // Date validation
        const dobInput = admissionForm.querySelector('[name="dateOfBirth"]');
        if (dobInput.value) {
            const dob = new Date(dobInput.value);
            if (isNaN(dob.getTime())) {
                isValid = false;
                errors.dateOfBirth = 'Please enter a valid date';
                dobInput.classList.add('is-invalid');
            }
        }

        // Gender validation
        const genderInput = admissionForm.querySelector('[name="gender"]');
        if (genderInput.value && !['Male', 'Female', 'Other'].includes(genderInput.value)) {
            isValid = false;
            errors.gender = 'Please select a valid gender';
            genderInput.classList.add('is-invalid');
        }

        return { isValid, errors };
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Form submission
    admissionForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous error messages
        admissionForm.querySelectorAll('.is-invalid').forEach(input => {
            input.classList.remove('is-invalid');
            const errorMessage = input.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });

        // Validate form
        const { isValid, errors } = validateForm();
        if (!isValid) {
            Object.entries(errors).forEach(([field, message]) => {
                const input = admissionForm.querySelector(`[name="${field}"]`);
                if (input) {
                    input.classList.add('is-invalid');
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message';
                    errorDiv.textContent = message;
                    input.parentNode.appendChild(errorDiv);
                }
            });
            return;
        }

        try {
            // Show loading state
            const submitButton = admissionForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';

            const formData = new FormData(admissionForm);
            const data = Object.fromEntries(formData);
            
            // Log form data before sending
            console.log('Form data:', data);
            
            // Format date to ISO string
            if (data.dateOfBirth) {
                data.dateOfBirth = new Date(data.dateOfBirth).toISOString();
            }
            
            // Ensure gender is properly capitalized
            if (data.gender) {
                data.gender = data.gender.charAt(0).toUpperCase() + data.gender.slice(1).toLowerCase();
            }

            const response = await fetch('/api/admission', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();
            console.log('Server response:', result);

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: `Application submitted successfully. Your application number is ${result.data.applicantNumber}`,
                    confirmButtonText: 'OK'
                }).then((result) => {
                    if (result.isConfirmed) {
                        admissionForm.reset();
                    }
                });
            } else {
                // Handle validation errors
                if (result.errors) {
                    let errorMessage = 'Please correct the following errors:\n';
                    Object.entries(result.errors).forEach(([field, message]) => {
                        errorMessage += `\n${field}: ${message}`;
                        // Highlight the invalid field
                        const input = admissionForm.querySelector(`[name="${field}"]`);
                        if (input) {
                            input.classList.add('is-invalid');
                            const errorDiv = document.createElement('div');
                            errorDiv.className = 'error-message';
                            errorDiv.textContent = message;
                            input.parentNode.appendChild(errorDiv);
                        }
                    });
                    throw new Error(errorMessage);
                }
                throw new Error(result.message || 'Error submitting application');
            }
        } catch (error) {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error!',
                text: error.message || 'Failed to submit application. Please try again.',
                confirmButtonText: 'OK'
            });
        } finally {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        }
    });

    // Clear error messages when input changes
    admissionForm.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', function() {
            this.classList.remove('is-invalid');
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        });
    });
}); 