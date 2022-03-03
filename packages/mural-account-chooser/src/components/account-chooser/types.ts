interface AutomaticOptions {
    email: string;
    signup?: boolean;
    consentSso?: boolean;
}

export interface AuthorizeParams {
    auto?: boolean | AutomaticOptions;
    signup?: boolean;
}
