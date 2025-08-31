package TuEvento.Backend.dto.responses;

import java.io.Serializable;

public class ResponseDto<T> implements Serializable {
    private boolean success;
    private String message;
    private T data;

    public ResponseDto() {}

    public ResponseDto(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ResponseDto(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // Métodos estáticos de fábrica
    public static <T> ResponseDto<T> ok(String message, T data) {
        return new ResponseDto<>(true, message, data);
    }

    public static <T> ResponseDto<T> ok(T data) {
        return new ResponseDto<>(true, null, data);
    }

    public static <T> ResponseDto<T> ok(String message) {
        return new ResponseDto<>(true, message, null);
    }

    public static <T> ResponseDto<T> error(String message) {
        return new ResponseDto<>(false, message, null);
    }

    public static <T> ResponseDto<T> error(String message, T data) {
        return new ResponseDto<>(false, message, data);
    }

    // Getters and setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public T getData() {
        return data;
    }

    public void setData(T data) {
        this.data = data;
    }
}