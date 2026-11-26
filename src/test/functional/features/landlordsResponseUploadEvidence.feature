@JIRA-TEST-KEY:HDPD-1258 @regression
Feature: Landlord response - Upload evidence for tenancy details
    As a landlord responding to a tenant's open market rent application
    I want to optionally upload evidence to support my response to the tenancy details
    So that the tribunal can consider it alongside my response

    Background:
        Given the user navigates to PT url
        And the "landlord" user has successfully logged on to market-rent-determination application
        Then check that the user is redirected to the my-application page
        When I open the latest respondent case
        Then the page URL should be "landlord-response/task-list"
        When I click "Respond to the tenant's application" link
        And I click "Start now"
        And I select "Yes" for the question "Has the tenant provided the correct address of the property?"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I select "Yes" for the question "Did you serve the notice proposing a new rent provided in the tenant’s application?"
        And I click "Save and continue"
        Then I check that the text "Review tenancy details" is displayed on the page
        When I select "Yes" for the question "Do you want to respond to any answers from the tenant about tenancy details?"
        And I enter "respond to tenancy details" for the question "Tell us more about the tenancy details provided by the tenant"
        And I click "Save and continue"
        Then the page URL should be "upload-evidence-tenancy-details"
        When I remove all previously uploaded evidence files

    @AC01 @JIRA-TEST-KEY:PTSD-1111
    Scenario: Upload evidence page displays its content and controls
        Then I should see the heading "Upload evidence to support your response to the tenancy details provided by the tenant (optional)"
        And the page URL should be "landlord-response/upload-evidence-tenancy-details"
        And I should see the link "Back"
        And I should see the button "Save and continue"
        And I should see the button "Save for later"

    @AC02 @JIRA-TEST-KEY:PTSD-1112
    Scenario: Continue without uploading any files
        Given no evidence files have been uploaded
        When I click "Save and continue"
        Then no upload error summary should be displayed
        And the page URL should be "review-property-details"
        When I click back link
        And I click back link
        Then I check "Yes" is selected for the question "Do you want to respond to any answers from the tenant about tenancy details?"
        And I check "respond to tenancy details" for the question "Tell us more about the tenancy details provided by the tenant"

    @AC03 @JIRA-TEST-KEY:PTSD-1113
    Scenario: Selecting a single file shows its name
        When I select the file "test-pdf.pdf" for upload
        Then I check that file name "test-pdf.pdf" is displayed on the page with green tick mark

    @AC03 @JIRA-TEST-KEY:PTSD-1113
    Scenario: Selecting multiple files shows each file name
        When I upload files "test-pdf.pdf, supportedFile.docx, test-image.jpg" in parallel
        Then I check that file name "test-pdf.pdf" is displayed on the page with green tick mark
        And I check that file name "supportedFile.docx" is displayed on the page with green tick mark
        And I check that file name "test-image.jpg" is displayed on the page with green tick mark

    @AC04 @JIRA-TEST-KEY:PTSD-1114
    Scenario Outline: A valid existing file is saved against the application
        When I select the file "<file>" for upload
        Then I check that file name "<file>" is displayed on the page with green tick mark
        When I click "Save and continue"
        Then no upload error summary should be displayed
        And the page URL should be "review-property-details"
        When I click back link
        Then the saved evidence file "<file>" should be listed
        Examples:
            | file               |
            | supportedFile.docx |
            | test-pdf.pdf       |
            | test-image.jpg     |
            | test-png.png       |

    @AC05 @JIRA-TEST-KEY:PTSD-1115
    Scenario Outline: Invalid files show a linked error and are not saved
        Given no evidence files have been uploaded
        When I select the invalid evidence file "<file>"
        Then the page URL should be "upload-evidence-tenancy-details"
        And the upload error summary and inline error should display "<error>"
        And no evidence files have been uploaded
        When I click "Save and continue"
        Then the page URL should be "review-property-details"
        When I click back link
        Then no evidence files have been uploaded
        Examples:
            | file         | error                                                                                                                      |
            | evidence.exe | The selected file must be a DOC, DOCX, XLS, XLSX, PPT, PPTX, PDF, RTF, TXT, CSV, JPG, JPEG, PNG, BMP, TIF, TIFF, MP3 or MP4 |
            | empty.pdf    | The selected file is empty                                                                                                 |

    @AC05 @JIRA-TEST-KEY:PTSD-1119
    Scenario: A mixed batch uploads the valid file and rejects the invalid file
        Given no evidence files have been uploaded
        When I select a valid PDF and an unsupported file together
        Then the page URL should be "upload-evidence-tenancy-details"
        And I check that file name "test-pdf.pdf" is displayed on the page with green tick mark
        And exactly one evidence file should be listed
        When I reload the evidence page
        Then the saved evidence file "test-pdf.pdf" should be listed
        And exactly one evidence file should be listed

    @AC06 @JIRA-TEST-KEY:PTSD-1116
    Scenario: Save for later with no file selected
        Given no evidence files have been uploaded
        When I click "Save for later"
        Then the page URL should be "landlord-response/task-list"
        And I should see the heading "Case overview"

    @AC06 @JIRA-TEST-KEY:PTSD-1118
    Scenario: Save for later persists a file when the landlord returns
        When I select the file "test-pdf.pdf" for upload
        Then I check that file name "test-pdf.pdf" is displayed on the page with green tick mark
        When I click "Save for later"
        Then the page URL should be "landlord-response/task-list"
        And I should see the heading "Case overview"
        When I click "Respond to the tenant's application" link
        And I click "Start now"
        And I select "Yes" for the question "Has the tenant provided the correct address of the property?"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I click "Save and continue"
        And I select "Yes" for the question "Did you serve the notice proposing a new rent provided in the tenant’s application?"
        And I click "Save and continue"
        Then I check that the text "Review tenancy details" is displayed on the page
        When I select "Yes" for the question "Do you want to respond to any answers from the tenant about tenancy details?"
        And I enter "respond to tenancy details" for the question "Tell us more about the tenancy details provided by the tenant"
        And I click "Save and continue"
        Then the page URL should be "upload-evidence-tenancy-details"
        And the saved evidence file "test-pdf.pdf" should be listed

    @AC07 @JIRA-TEST-KEY:PTSD-1120
    Scenario: Back returns to the saved response to tenancy details
        When I click back link
        Then the page URL should be "review-tenancy-details"
        And I check "Yes" is selected for the question "Do you want to respond to any answers from the tenant about tenancy details?"
        And I check "respond to tenancy details" for the question "Tell us more about the tenancy details provided by the tenant"
