"use client";

const ProfileFormSkeleton = ({ rows = 2 }) => {
  return (
    <div className="profile-form-skeleton" aria-hidden="true">
      <div className="row">
        {Array.from({ length: rows }).map((_, index) => (
          <div className="col-sm-6 col-xl-4" key={index}>
            <div className="profile-form-skeleton__field mb20">
              <div className="profile-form-skeleton__label" />
              <div className="profile-form-skeleton__input" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileFormSkeleton;
