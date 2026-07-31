<?php

namespace App\Http\Requests;

use App\Models\Location;
use App\Models\Ride;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRideRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Ride::class) === true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:10000'],
            'location_external_id' => [
                'required',
                'uuid',
                Rule::exists(Location::class, 'external_id')->where(
                    fn ($query) => $query
                        ->whereNull('user_id')
                        ->orWhere('user_id', $this->user()?->id),
                ),
            ],
            'fit_file' => ['required', 'file', 'max:51200', 'extensions:fit'],
        ];
    }
}
