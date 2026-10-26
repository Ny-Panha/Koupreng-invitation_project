import InvitationLabel from '@/features/templates/shared/InvitationLabel';
import { useEffect, useState } from "react";
import { IoImageOutline } from "react-icons/io5";

export default function TemplateImage({ src, alt, className, loading = "lazy", ...props }) {
    const [failed, setFailed] = useState(!src);

    useEffect(() => {
        setFailed(!src);
    }, [src]);

    if (failed) {
        return (
            <span className={`tx-image-fallback${className ? ` ${className}` : ""}`} role="img" aria-label={alt}>
                <IoImageOutline aria-hidden="true" />
                <small><InvitationLabel value={"រូបភាពអនុស្សាវរីយ៍"} /></small>
            </span>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            loading={loading}
            onError={() => setFailed(true)}
            {...props}
        />
    );
}
