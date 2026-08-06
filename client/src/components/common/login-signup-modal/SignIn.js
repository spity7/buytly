import React from "react";
import AuthTabSwitch from "./AuthTabSwitch";
import GoogleIcon from "./GoogleIcon";

const SignIn = () => {
  return (
    <form className="form-style1">
      <div className="mb25">
        <label className="form-label fw600 dark-color">Email</label>
        <input
          type="email"
          className="form-control"
          placeholder="Enter Email"
          required
        />
      </div>
      {/* End email */}

      <div className="mb15">
        <label className="form-label fw600 dark-color">Password</label>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Password"
          required
        />
      </div>
      {/* End Password */}

      <div className="checkbox-style1 d-block d-sm-flex align-items-center justify-content-between mb10">
        <label className="custom_checkbox fz14 ff-heading">
          Remember me
          <input type="checkbox" defaultChecked="checked" />
          <span className="checkmark" />
        </label>
        <a className="fz14 ff-heading" href="#">
          Lost your password?
        </a>
      </div>
      {/* End  Lost your password? */}

      <div className="d-grid mb20">
        <button className="ud-btn btn-thm" type="submit">
          Sign in <i className="fal fa-arrow-right-long" />
        </button>
      </div>
      {/* End submit */}

      <div className="hr_content mb20">
        <hr />
        <span className="hr_top_text">OR</span>
      </div>

      <div className="d-grid mb20">
        <button className="ud-btn btn-google" type="button">
          <GoogleIcon className="google-icon" /> Continue with Google
        </button>
      </div>
      <p className="dark-color text-center mb0 mt10">
        Not signed up?{" "}
        <AuthTabSwitch
          tab="signup"
          className="btn btn-link dark-color fw600 p-0 border-0 align-baseline"
        >
          Create an account.
        </AuthTabSwitch>
      </p>
    </form>
  );
};

export default SignIn;
